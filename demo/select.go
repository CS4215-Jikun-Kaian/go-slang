package main
import "fmt"

ch1 chan int = make(chan int)
ch2 chan int = make(chan int)

func f1() {
	for i := 0; i < 10; i++ {
		ch1 <- 1
	}
}()

func f2() {
	for i := 0; i < 10; i++ {
		ch2 <- 1
	}
}()

func main() {
	go f1()
	go f2()

	i, value int
  for i = 0; i < 20; i++ {
    select {
      case value = <- ch1:
        fmt.Println("read ch1")
      case value = <- ch2:
        fmt.Println("read ch2")
    }
  }
}

