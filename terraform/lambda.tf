# Code is deployed out-of-band (console / CLI / a separate workflow), not by
# Terraform. The aws_lambda_function resource requires *some* code source to
# satisfy schema validation, so we generate a tiny placeholder zip — but
# `lifecycle.ignore_changes` below ensures the placeholder never overwrites
# the real deployed code after import.
data "archive_file" "lambda_stub" {
  type        = "zip"
  output_path = "${path.module}/.lambda-stub.zip"

  source {
    content  = "exports.handler = async () => ({ statusCode: 200 });"
    filename = "index.js"
  }
}

resource "aws_lambda_function" "leaderboard" {
  function_name = "AiGuesserLeaderboardAPI"
  role          = aws_iam_role.lambda_exec.arn

  filename         = data.archive_file.lambda_stub.output_path
  source_code_hash = data.archive_file.lambda_stub.output_base64sha256

  runtime = "nodejs24.x"
  handler = "index.handler"

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.leaderboard.name
    }
  }

  lifecycle {
    ignore_changes = [
      filename,
      source_code_hash,
      s3_key,
      s3_object_version,
      s3_bucket,
    ]
  }
}
