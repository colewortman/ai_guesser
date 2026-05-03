data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# Role was created by the AWS Lambda console wizard, which places it under
# /service-role/ and attaches a customer-managed copy of the basic-execution
# policy. We don't manage that attachment here — the role keeps it.
resource "aws_iam_role" "lambda_exec" {
  name               = "AiGuesserLeaderboardAPI-role-s05f8yy4"
  path               = "/service-role/"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

data "aws_iam_policy_document" "lambda_dynamodb" {
  statement {
    sid     = "statement1"
    actions = ["dynamodb:PutItem", "dynamodb:Query"]
    resources = [
      aws_dynamodb_table.leaderboard.arn,
      "${aws_dynamodb_table.leaderboard.arn}/index/ScoreIndex",
    ]
  }
}

resource "aws_iam_role_policy" "lambda_dynamodb" {
  name   = "AiGuesser-dynamoAccess"
  role   = aws_iam_role.lambda_exec.id
  policy = data.aws_iam_policy_document.lambda_dynamodb.json
}
