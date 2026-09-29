import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import type { OptionField } from './GenericFunctions';
import { applyOptions, requireString, runActorAndGetItems } from './GenericFunctions';

// ScrapeUnblocker's public "Skyscanner Hotels Scraper" Actor: https://apify.com/scrapeunblocker/skyscanner-hotels-scraper
const ACTOR_ID = 'phwjR5XHnhXPAKtGZ';
const INTEGRATION_APP_ID = 'scrapeunblocker-skyscanner-hotels-scraper';

// Node option name -> Actor input key.
const OPTION_FIELDS: Record<string, OptionField> = {
	checkin: {
		key: 'checkin',
	},
	checkout: {
		key: 'checkout',
	},
	adults: {
		key: 'adults',
	},
	rooms: {
		key: 'rooms',
	},
	currency: {
		key: 'currency',
		kind: 'upper',
	},
	market: {
		key: 'market',
		kind: 'upper',
	},
	locale: {
		key: 'locale',
	},
};

function buildActorInput(
	this: IExecuteFunctions,
	resource: string,
	operation: string,
	options: IDataObject,
	itemIndex: number,
): IDataObject {
	const input: IDataObject = {};

	switch (`${resource}:${operation}`) {
		case 'hotel:search': {
			input.destination = requireString.call(this, 'destination', 'Destination', itemIndex);
			input.maxResults = this.getNodeParameter('maxResults', itemIndex);
			break;
		}
		default:
			throw new NodeOperationError(
				this.getNode(),
				`The operation "${operation}" is not supported for resource "${resource}"`,
				{ itemIndex },
			);
	}

	applyOptions(input, options, OPTION_FIELDS);
	return input;
}

export class SkyscannerHotelsScraper implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Skyscanner Hotels Scraper',
		name: 'skyscannerHotelsScraper',
		icon: {
			light: 'file:skyscannerHotelsScraper.png',
			dark: 'file:skyscannerHotelsScraper.dark.png',
		},
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Search live hotel prices for a city and dates on Skyscanner with the ScrapeUnblocker Actor on Apify',
		defaults: {
			name: 'Skyscanner Hotels Scraper',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'apifyApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Hotel',
						value: 'hotel',
					},
				],
				default: 'hotel',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['hotel'],
					},
				},
				options: [
					{
						name: 'Search',
						value: 'search',
						description: 'Search hotels in a city or place',
						action: 'Search hotels',
					},
				],
				default: 'search',
			},
			{
				displayName: 'Destination',
				name: 'destination',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'London',
				description: "City or place to search hotels in, e.g. 'London' or 'Paris'",
				displayOptions: {
					show: {
						resource: ['hotel'],
						operation: ['search'],
					},
				},
			},
			{
				displayName: 'Max Results',
				name: 'maxResults',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 300,
				},
				default: 30,
				description: 'Maximum number of hotels to return, cheapest first (1-300)',
				displayOptions: {
					show: {
						resource: ['hotel'],
						operation: ['search'],
					},
				},
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Adults',
						name: 'adults',
						type: 'number',
						typeOptions: {
							minValue: 1,
							maxValue: 16,
						},
						default: 2,
						description: 'Number of adult guests (1-16)',
					},
					{
						displayName: 'Check-In Date',
						name: 'checkin',
						type: 'string',
						default: '',
						placeholder: '2026-11-12',
						description: 'Check-in date as YYYY-MM-DD. Leave blank for about 30 days from today.',
					},
					{
						displayName: 'Check-Out Date',
						name: 'checkout',
						type: 'string',
						default: '',
						placeholder: '2026-11-14',
						description: 'Check-out date as YYYY-MM-DD. Leave blank for 2 nights after check-in.',
					},
					{
						displayName: 'Currency',
						name: 'currency',
						type: 'string',
						default: 'EUR',
						placeholder: 'EUR',
						description:
							'Currency of the prices (ISO code, e.g. EUR, USD or GBP). Defaults to EUR.',
					},
					{
						displayName: 'Locale',
						name: 'locale',
						type: 'string',
						default: 'en-GB',
						placeholder: 'en-GB',
						description: 'Language of the results (e.g. en-GB or de-DE). Defaults to en-GB.',
					},
					{
						displayName: 'Market',
						name: 'market',
						type: 'string',
						default: 'UK',
						placeholder: 'UK',
						description:
							'Country you are booking from (e.g. UK, US or DE). It affects prices. Defaults to UK.',
					},
					{
						displayName: 'Rooms',
						name: 'rooms',
						type: 'number',
						typeOptions: {
							minValue: 1,
							maxValue: 8,
						},
						default: 1,
						description: 'Number of rooms (1-8)',
					},
					{
						displayName: 'Timeout (Seconds)',
						name: 'timeout',
						type: 'number',
						typeOptions: {
							minValue: 0,
						},
						default: 0,
						description:
							'Maximum run time of the Apify Actor run. 0 keeps the Actor default. A run that times out fails the node.',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				const options = this.getNodeParameter('options', i, {}) as IDataObject;
				const { timeout, ...actorOptions } = options;

				const input = buildActorInput.call(this, resource, operation, actorOptions, i);
				const { items: results } = await runActorAndGetItems.call(this, {
					actorId: ACTOR_ID,
					integrationAppId: INTEGRATION_APP_ID,
					input,
					itemIndex: i,
					timeoutSecs: (timeout as number) || undefined,
				});

				for (const result of results) {
					returnData.push({ json: result, pairedItem: { item: i } });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				// Both constructors return an error of their own class unchanged.
				if (error instanceof NodeApiError) {
					throw new NodeApiError(this.getNode(), error as unknown as JsonObject, { itemIndex: i });
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
