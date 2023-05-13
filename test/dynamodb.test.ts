import { expect } from "chai";
import { randomBytes } from "node:crypto";
import { DynamoDB } from "../src/dynamodb";

describe("DynamoDB", () => {
  const dynamodb = new DynamoDB({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    },
    defaultTable: "feathermint-test",
  });
  const item = {
    id: { S: randomBytes(12).toString("hex") },
    timestamp: { N: Date.now().toString() },
    expdate: { N: dynamodb.expdate(60) },
  };

  it("executes basic CRUD operations", async () => {
    // Create
    {
      const response = await dynamodb.put({ item });
      expect(response.$metadata.httpStatusCode).to.equal(200);
    }

    // Read
    {
      const response = await dynamodb.get({ key: { id: item.id } });
      expect(response.$metadata.httpStatusCode).to.equal(200);
      expect(response.Item).to.deep.equal(item);
    }

    // Update
    {
      const updatedItem = {
        ...item,
        timestamp: { N: Date.now().toString() },
      };
      const putResponse = await dynamodb.put({ item: updatedItem });
      expect(putResponse.$metadata.httpStatusCode).to.equal(200);

      const getResponse = await dynamodb.get({ key: { id: item.id } });
      expect(getResponse.$metadata.httpStatusCode).to.equal(200);
      expect(getResponse.Item).to.deep.equal(updatedItem);
    }

    // Delete
    {
      const deleteResponse = await dynamodb.delete({
        key: { id: item.id },
      });
      expect(deleteResponse.$metadata.httpStatusCode).to.equal(200);

      const getResponse = await dynamodb.get({ key: { id: item.id } });
      expect(getResponse.$metadata.httpStatusCode).to.equal(200);
      expect(getResponse.Item).to.be.undefined;
    }
  });
});
