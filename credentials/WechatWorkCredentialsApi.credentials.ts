import {
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestHelper,
	INodeProperties,
} from 'n8n-workflow';
import { IHttpRequestOptions } from 'n8n-workflow/dist/Interfaces';

export class WechatWorkCredentialsApi implements ICredentialType {
	name = 'wechatWorkCredentialsApi';
	displayName = 'Wechat Work Credentials API';
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'qyapi.weixin.qq.com',
			required: true,
		},
		{
			displayName: 'Corpid',
			name: 'corpid',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Corpsecret',
			name: 'corpsecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
		{
			displayName: 'AccessToken',
			name: 'accessToken',
			type: 'hidden',
			default: '',
			typeOptions: {
				expirable: true,
			},
		},
	];

	async preAuthentication(this: IHttpRequestHelper, credentials: ICredentialDataDecryptedObject) {
		console.log('credentials', credentials);
		if (credentials.accessToken) {
			// 验证是否正常，正常直接使用即可
			const res = (await this.helpers.httpRequest({
				method: 'GET',
				url: `https://qyapi.weixin.qq.com/cgi-bin/get_api_domain_ip?access_token=${credentials.accessToken}`,
			})) as any;

			console.log('exist accessToken', res);
			// accesstoken过期了
			if (res.errcode === 42001) {
			} else if (res.errcode !== 0) {
				throw new Error('请求失败：' + res.errcode + ', ' + res.errmsg);
			}
		}

		const res = (await this.helpers.httpRequest({
			method: 'GET',
			url: `https://${credentials.baseUrl}/cgi-bin/gettoken?corpid=${credentials.corpid}&corpsecret=${credentials.corpsecret}`,
		})) as any;

		console.log('preAuthentication', res);

		if (res.errcode !== 0) {
			throw new Error('授权失败：' + res.errcode + ', ' + res.errmsg);
		}

		return { accessToken: res.access_token };
	}

	//此凭据当前没有被任何节点直接使用
	//但是HTTP请求节点可以用它来发出请求。
	//由于下面的“test”属性，该凭据也是可测试的
	// authenticate: IAuthenticateGeneric = {
	// 	type: 'generic',
	// 	properties: {
	// 		qs: {
	// 			access_token: '={{ $credentials.access_token }}',
	// 		},
	// 	},
	// };

	async authenticate(
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		requestOptions.baseURL = `https://${credentials.baseUrl}`;
		requestOptions.qs = {
			access_token: credentials.accessToken,
		};
		// requestOptions.proxy = {
		// 	host: '127.0.0.1',
		// 	port: 8000,
		// 	protocol: 'http'
		// }
		// requestOptions.skipSslCertificateValidation = true;

		return requestOptions;
	}

	// The block below tells how this credential can be tested
	test: ICredentialTestRequest = {
		request: {
			baseURL: '=https://{{$credentials.baseUrl}}',
			url: '/cgi-bin/get_api_domain_ip',
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					key: 'errcode',
					value: 0,
					message: '凭证验证失败',
				},
			},
		],
	};
}
