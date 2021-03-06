import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { HitCounter } from "./hit-counter";

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const helloHandler = new lambda.Function(this, "HelloHandler", {
      runtime: lambda.Runtime.NODEJS_14_X, // execution environment
      code: lambda.Code.fromAsset("lambda"), // code loaded from "lambda" directory
      handler: "hello.handler", // file is "hello", function is "handler"
    });

    const hitCounter = new HitCounter(this, "HelloHitCounter", {
      downstream: helloHandler,
    });

    const apiGateway = new apigw.LambdaRestApi(this, "Endpoint", {
      handler: hitCounter.handler,
    });
  }
}
