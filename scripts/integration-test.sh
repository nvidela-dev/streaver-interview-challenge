#!/bin/bash

# Integration test script for Posts API
# Runs curl commands against the actual API with seeded database

set -e

BASE_URL="http://localhost:3000"
PASSED=0
FAILED=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧪 Running API Integration Tests${NC}"
echo ""

# Check if server is running
check_server() {
  if ! curl -s "$BASE_URL" > /dev/null 2>&1; then
    echo -e "${RED}❌ Server is not running at $BASE_URL${NC}"
    echo "Please start the server with 'npm run dev' first"
    exit 1
  fi
  echo -e "${GREEN}✓ Server is running${NC}"
  echo ""
}

# Test helper function
test_endpoint() {
  local name="$1"
  local method="$2"
  local url="$3"
  local expected_status="$4"
  local check_body="$5"

  echo -n "Testing: $name... "

  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "$url")
  elif [ "$method" = "DELETE" ]; then
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$url")
  fi

  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$status_code" != "$expected_status" ]; then
    echo -e "${RED}FAILED${NC}"
    echo "  Expected status: $expected_status, Got: $status_code"
    echo "  Response: $body"
    ((FAILED++))
    return 1
  fi

  if [ -n "$check_body" ]; then
    if ! echo "$body" | grep -q "$check_body"; then
      echo -e "${RED}FAILED${NC}"
      echo "  Response body doesn't contain: $check_body"
      echo "  Response: $body"
      ((FAILED++))
      return 1
    fi
  fi

  echo -e "${GREEN}PASSED${NC}"
  ((PASSED++))
  return 0
}

# Run tests
check_server

echo "=== GET /api/posts ==="
test_endpoint "Get all posts" "GET" "$BASE_URL/api/posts" "200" "author"

echo ""
echo "=== GET /api/posts (verify count) ==="
post_count=$(curl -s "$BASE_URL/api/posts" | grep -o '"id":' | wc -l | tr -d ' ')
if [ "$post_count" -eq 100 ]; then
  echo -e "Testing: Post count is 100... ${GREEN}PASSED${NC}"
  ((PASSED++))
else
  echo -e "Testing: Post count is 100... ${RED}FAILED${NC} (got $post_count)"
  ((FAILED++))
fi

echo ""
echo "=== GET /api/posts?userId=1 ==="
test_endpoint "Filter posts by userId=1" "GET" "$BASE_URL/api/posts?userId=1" "200" "author"

# Verify filtered count (user 1 should have 10 posts based on jsonplaceholder data)
filtered_count=$(curl -s "$BASE_URL/api/posts?userId=1" | grep -o '"id":' | wc -l | tr -d ' ')
if [ "$filtered_count" -eq 10 ]; then
  echo -e "Testing: Filtered count is 10... ${GREEN}PASSED${NC}"
  ((PASSED++))
else
  echo -e "Testing: Filtered count is 10... ${RED}FAILED${NC} (got $filtered_count)"
  ((FAILED++))
fi

echo ""
echo "=== GET /api/posts?userId=invalid ==="
test_endpoint "Invalid userId returns 400" "GET" "$BASE_URL/api/posts?userId=invalid" "400" "error"

echo ""
echo "=== DELETE /api/posts/1 ==="
test_endpoint "Delete post 1" "DELETE" "$BASE_URL/api/posts/1" "200" "message"

echo ""
echo "=== Verify post was deleted ==="
# Try to delete again - should get 404
test_endpoint "Delete same post again returns 404" "DELETE" "$BASE_URL/api/posts/1" "404" "error"

echo ""
echo "=== DELETE /api/posts/invalid ==="
test_endpoint "Invalid post id returns 400" "DELETE" "$BASE_URL/api/posts/invalid" "400" "error"

echo ""
echo "=== DELETE /api/posts/99999 ==="
test_endpoint "Non-existent post returns 404" "DELETE" "$BASE_URL/api/posts/99999" "404" "error"

# Summary
echo ""
echo "================================"
echo -e "📊 Results: ${GREEN}$PASSED passed${NC}, ${RED}$FAILED failed${NC}"
echo "================================"

if [ "$FAILED" -gt 0 ]; then
  exit 1
fi

echo ""
echo -e "${YELLOW}⚠️  Note: Post 1 was deleted. Run 'npm run db:reset' to restore.${NC}"
