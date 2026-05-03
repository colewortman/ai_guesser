resource "aws_apigatewayv2_api" "leaderboard" {
  name          = "AiGuesserLeaderboardAPI"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = [
      "http://localhost:3000",
      "https://${var.domain_name}",
    ]
    allow_methods = ["GET", "POST", "OPTIONS"]
    allow_headers = ["content-type"]
  }
}

resource "aws_apigatewayv2_integration" "leaderboard_get" {
  api_id                 = aws_apigatewayv2_api.leaderboard.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.leaderboard.arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "leaderboard_post" {
  api_id                 = aws_apigatewayv2_api.leaderboard.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.leaderboard.arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "leaderboard_get" {
  api_id    = aws_apigatewayv2_api.leaderboard.id
  route_key = "GET /scores"
  target    = "integrations/${aws_apigatewayv2_integration.leaderboard_get.id}"
}

resource "aws_apigatewayv2_route" "leaderboard_post" {
  api_id    = aws_apigatewayv2_api.leaderboard.id
  route_key = "POST /scores"
  target    = "integrations/${aws_apigatewayv2_integration.leaderboard_post.id}"
}

resource "aws_apigatewayv2_stage" "leaderboard" {
  api_id      = aws_apigatewayv2_api.leaderboard.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "apigw_invoke" {
  statement_id  = "12e8e323-0407-5602-ae81-23ed14c5bdb2"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.leaderboard.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.leaderboard.execution_arn}/*/*/scores"
}
