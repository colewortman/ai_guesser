resource "aws_dynamodb_table" "leaderboard" {
  name         = "AiGuesserLeaderboard"
  billing_mode = "PAY_PER_REQUEST"


  hash_key = "id"

  attribute {
    name = "id"
    type = "S"
  }
}
