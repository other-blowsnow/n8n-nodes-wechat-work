import {
	IDataObject,
	IExecuteFunctions,
	INodeCredentialTestResult,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { ICredentialsDecrypted, ICredentialTestFunctions } from 'n8n-workflow/dist/Interfaces';
import ResourceBuilder from '../help/builder/ResourceBuilder';
import ModuleLoadUtils from '../help/utils/ModuleLoadUtils';
import { ResourceOperations } from '../help/type/IResource';

const resourceBuilder = new ResourceBuilder();
ModuleLoadUtils.loadModules(__dirname, 'resource/*.js').forEach((resource) => {
	resourceBuilder.addResource(resource);
	ModuleLoadUtils.loadModules(__dirname, `resource/${resource.value}/*.js`).forEach((operate: ResourceOperations) => {
		resourceBuilder.addOperate(resource.value, operate);
	})
});

export class WechatWorkNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Wechat Work Node',
		name: 'wechatWorkNode',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-icon-not-svg
		icon: 'file:icon.png',
		group: ['transform'],
		version: 1,
		description: 'Wechat Work Node',
		defaults: {
			name: 'Wechat Work Node',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'wechatWorkCredentialsApi',
				required: true,
				testedBy: 'accessTokenTest',
			},
		],
		properties: resourceBuilder.build(),
	};

	methods = {
		credentialTest: {
			async accessTokenTest(
				this: ICredentialTestFunctions,
				credential: ICredentialsDecrypted,
			): Promise<INodeCredentialTestResult> {
				const credentials = credential.data as IDataObject;

				const res = (await this.helpers.request({
					method: 'GET',
					url: `https://${credentials.baseUrl}/cgi-bin/gettoken?corpid=${credentials.username}&corpsecret=${credentials.password}`,
				})) as { access_token: string };

				console.log('credentialTest', res);

				return {
					status: 'Error',
					message: 'test',
				};
			},
		},
	};

	// The function below is responsible for actually doing whatever this node
	// is supposed to do. In this case, we're just appending the `myString` property
	// with whatever the user has entered.
	// You can make async calls and use `await`.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let responseData: IDataObject = {};
		let returnData = [];

		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		const callFunc = resourceBuilder.getCall(resource, operation);

		if (!callFunc) {
			throw new NodeOperationError(this.getNode(), '未实现方法: ' + resource + '.' + operation);
		}


		// Iterates over all input items and add the key "myString" with the
		// value the parameter "myString" resolves to.
		// (This could be a different value for each item in case it contains an expression)
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				this.logger.debug('call function', {
					resource,
					operation,
					itemIndex
				});

				responseData = await callFunc.call(this, itemIndex);
			} catch (error) {
				this.logger.error('call function error', {
					resource,
					operation,
					itemIndex,
					errorMessage: error.message,
					stack: error.stack
				})

				// This node should never fail but we want to showcase how
				// to handle errors.
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message
						},
						pairedItem: itemIndex,
					});
					continue;
				} else {
					throw new NodeOperationError(this.getNode(), error, {
						message: error.message,
						itemIndex,
					});
				}
			}
			const executionData = this.helpers.constructExecutionMetaData(
				this.helpers.returnJsonArray(responseData as IDataObject),
				{ itemData: { item: itemIndex } },
			);
			returnData.push(...executionData);
		}

		return [returnData];
	}
}
