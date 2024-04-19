package main
import "fmt"

func factorial(n int) int {
  if n == 1 {
    return 1
  } else {
    return factorial(n - 1) * n
  }
}

func main() {
  fmt.Println(factorial(5))
}

