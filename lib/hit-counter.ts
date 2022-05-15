import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export interface HitCounterProps {
  /** the function for which we want to count url hits **/
  downstream: lambda.IFunction;
}

export class HitCounter extends Construct {
  /** allows accessing the counter function */
  public readonly handler: lambda.Function;

  constructor(scope: Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    const table = new dynamodb.Table(this, "Hits", {
      partitionKey: { name: "path", type: dynamodb.AttributeType.STRING },
    });

    this.handler = new lambda.Function(this, "HitCounterHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "hitcounter.handler",
      environment: {
        HITS_TABLE_NAME: table.tableName,
        DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
      },
    });

    // grant the lambda role read/write permissions to our table
    table.grantReadWriteData(this.handler);
    // grant the lambda role invoke permissions to the downstream function
    props.downstream.grantInvoke(this.handler);
  }
}
