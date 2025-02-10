import ResourceBuilder from '../../help/builder/resourceBuilder';
import ModuleLoadUtils from '../../help/utils/moduleLoadUtils';

class MessageResource {
	static init(resourceBuilder: ResourceBuilder) {
		resourceBuilder.addResource({
			name: '消息推送',
			value: 'message',
		});

		const modules = ModuleLoadUtils.loadModules(__dirname, 'message/*.js');
		for (const module of modules) {
			module.init(resourceBuilder);
		}
	}
}

export default MessageResource;
