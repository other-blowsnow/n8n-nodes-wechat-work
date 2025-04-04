import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import WechatWorkRequestUtils from '../../../help/utils/WechatWorkRequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';

const MessageRecallOperate: ResourceOperations = {
	name: '撤回消息',
	value: 'message:recall',
	description: '撤回24小时内通过发送应用消息接口推送的消息',
	options: [
		{
			displayName: '*消息ID',
			name: 'msgid',
			default: '',
			description: '从应用发送消息接口处获得的消息ID',
			type: 'string',
			required: true,
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const msgid = this.getNodeParameter('msgid', index) as string;

		const data: IDataObject = {
			msgid,
		};

		return WechatWorkRequestUtils.request.call(this, {
			method: 'POST',
			url: `/cgi-bin/message/recall`,
			body: data,
		});
	},
};

export default MessageRecallOperate;