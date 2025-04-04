import {IDataObject, IExecuteFunctions} from "n8n-workflow";
import WechatWorkRequestUtils from "../../../help/utils/WechatWorkRequestUtils";
import NodeUtils from "../../../help/utils/NodeUtils";
import {ResourceOperations} from "../../../help/type/IResource";

const MessageUpdateTemplateCardOperate: ResourceOperations = {

	name: '更新模版卡片消息',
	value: 'message:update_template_card',
	description: '参考文档: https://developer.work.weixin.qq.com/document/path/94888',
	options: [
		{
			displayName: '*企业应用的ID',
			name: 'agentid',
			default: '',
			description: '企业内部开发，可在应用的设置页面查看',
			type: 'string',
			required: true,
		},
		{
			displayName: '企业的成员ID列表',
			name: 'userids',
			description: '企业的成员ID列表（最多支持1000个）',
			type: 'fixedCollection',
			default: [],
			typeOptions: {
				multipleValues: true,
			},
			options: [
				{
					name: 'values',
					displayName: '成员列表',
					values: [
						{
							displayName: '成员UserID',
							name: 'id',
							type: 'string',
							default: '',
							required: true,
						},
					],
				},
			],
		},
		{
			displayName: '企业的部门ID列表',
			name: 'partyids',
			description: '企业的部门ID列表（最多支持100个）',
			type: 'fixedCollection',
			default: [],
			typeOptions: {
				multipleValues: true,
			},
			options: [
				{
					name: 'values',
					displayName: '列表',
					values: [
						{
							displayName: '部门ID',
							name: 'id',
							type: 'string',
							default: '',
							required: true,
						},
					],
				},
			],
		},
		{
			displayName: '企业的标签ID列表',
			name: 'tagids',
			description: '企业的标签ID列表（最多支持100个）',
			type: 'fixedCollection',
			default: [],
			typeOptions: {
				multipleValues: true,
			},
			options: [
				{
					name: 'values',
					displayName: '列表',
					values: [
						{
							displayName: '标签ID',
							name: 'id',
							type: 'string',
							default: '',
							required: true,
						},
					],
				},
			],
		},
		{
			displayName: '更新整个任务接收人员',
			name: 'atall',
			default: false,
			type: 'boolean',
		},
		{
			displayName: '*更新卡片所需要消费的Code',
			name: 'response_code',
			default: '',
			description: '更新卡片所需要消费的code，可通过发消息接口和回调接口返回值获取，一个code只能调用一次该接口，且只能在72小时内调用',
			type: 'string',
			required: true,
		},
		{
			displayName: '*需要更新的按钮的文案',
			name: 'button.replace_name',
			default: '',
			type: 'string',
			required: true,
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const agentid = this.getNodeParameter('agentid', index) as string;
		const response_code = this.getNodeParameter('response_code', index) as string;
		const buttonReplaceName = this.getNodeParameter('button.replace_name', index) as string;


		const userids = NodeUtils.getNodeFixedCollectionList(this.getNodeParameter('userids', index) as IDataObject, 'values', 'id');
		const partyids = NodeUtils.getNodeFixedCollectionList(this.getNodeParameter('partyids', index) as IDataObject, 'values', 'id');
		const tagids = NodeUtils.getNodeFixedCollectionList(this.getNodeParameter('tagids', index) as IDataObject, 'values', 'id');
		const atall = this.getNodeParameter('atall', index, false) as boolean;

		const data: IDataObject = {
			agentid,
			response_code,
			button: {
				replace_name: buttonReplaceName,
			},
		};

		if (userids) {
			data.userids = userids;
		}
		if (partyids) {
			data.partyids = partyids;
		}
		if (tagids) {
			data.tagids = tagids;
		}
		if (atall) {
			data.atall = atall;
		}

		return WechatWorkRequestUtils.request.call(this, {
			method: 'POST',
			url: `/cgi-bin/message/update_template_card`,
			body: data,
		});
	}
}


export default MessageUpdateTemplateCardOperate;
