import { INodePropertyOptions } from 'n8n-workflow/dist/Interfaces';
import { IResource, ResourceOperations } from '../type/IResource';
import { IDataObject, type IExecuteFunctions, INodeProperties } from 'n8n-workflow';

class ResourceBuilder {
	resources: IResource[] = [];

	addResource(resource: INodePropertyOptions) {
		this.resources.push({
			...resource,
			operations: [],
		});
	}

	addOperate(
		resourceName: string,
		operate: INodePropertyOptions,
		options: INodeProperties[],
		call: (this: IExecuteFunctions, index: number) => Promise<IDataObject>,
	) {
		const resource = this.resources.find((resource) => resource.name === resourceName);
		if (resource) {
			resource.operations.push({
				...operate,
				options,
				call,
			} as ResourceOperations);
		}
	}

	build(): INodeProperties[] {
		// 构建 Operations
		let list: INodeProperties[] = [];

		list.push({
			displayName: 'Resource',
			name: 'resource',
			type: 'options',
			noDataExpression: true,
			options: this.resources.map((item) => {
				return {
					...item,
					operations: null,
				};
			}),
			default: this.resources[0].value,
		});

		for (const resource of this.resources) {
			list.push({
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [resource.value],
					},
				},
				options: resource.operations.map((item) => {
					return {
						...item,
						options: null,
					};
				}),
				default: resource.operations[0].value,
			});

			for (const operation of resource.operations) {
				for (let option of operation.options) {
					// @ts-ignore
					list.push({
						...option,
						displayOptions: {
							...(option.displayOptions || {}),
							show: {
								...(option.displayOptions?.show || {}),
								resource: [resource.value],
								operation: [operation.value],
							},
						},
					});
				}
			}
		}

		return list;
	}

	getCall(
		resources: IResource[],
		resourceName: string,
		operateName: string,
	): Function | null {
		const resource = resources.find((item) => item.value === resourceName);
		if (!resource) {
			// @ts-ignore
			return null;
		}
		const operate = resource.operations.find((item) => item.value === operateName);
		// @ts-ignore
		return operate?.call;
	}
}

export default ResourceBuilder;
