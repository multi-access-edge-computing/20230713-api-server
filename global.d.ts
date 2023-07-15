export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      AWS_DYNAMODB_REGION: string;
      AWS_DYNAMODB_TABLE_NAME: string;
      AWS_DYNAMODB_WCU: string;
      AWS_DYNAMODB_RCU: string;
      ITEM_COUNT: string;
    }
  }
}
