import {
  DeleteItemCommand,
  DynamoDBClient,
  DynamoDBClientConfig,
  GetItemCommand,
  GetItemCommandInput,
  PutItemCommand,
  PutItemCommandInput,
} from "@aws-sdk/client-dynamodb";

export interface DymamoDBConfig extends DynamoDBClientConfig {
  defaultTable: string;
}

export class DynamoDB<
  Key extends GetItemCommandInput["Key"],
  Item extends PutItemCommandInput["Item"]
> {
  readonly #client: DynamoDBClient;
  readonly #defaultTable: string;

  constructor(config: DymamoDBConfig) {
    const { defaultTable, ...clientConfig } = config;
    this.#client = new DynamoDBClient(clientConfig);
    this.#defaultTable = defaultTable;
  }

  get(params: { key: Key; table?: string }) {
    const command = new GetItemCommand({
      Key: params.key,
      TableName: params.table ?? this.#defaultTable,
    });
    return this.#client.send(command);
  }

  put(params: { item: Item; table?: string }) {
    const command = new PutItemCommand({
      Item: params.item,
      TableName: params.table ?? this.#defaultTable,
    });
    return this.#client.send(command);
  }

  delete(params: { key: Key; table?: string }) {
    const command = new DeleteItemCommand({
      Key: params.key,
      TableName: params.table ?? this.#defaultTable,
    });
    return this.#client.send(command);
  }

  expdate(seconds: number) {
    return (Math.floor(Date.now() / 1000) + seconds).toString();
  }
}
