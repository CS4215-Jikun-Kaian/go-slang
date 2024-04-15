// adapted from https://github.com/antlr/grammars-v4/blob/master/golang/examples/chan.go
package samples

var ball chan string

func kickBall(playerName string) {
	for {
	  Println(<-ball, "kicked the ball.")
		Sleep(Second)
		ball <- playerName
	}
}

func Ch() {
	ball = make(chan string)
	go kickBall("John")
	go kickBall("Alice")
	go kickBall("Bob")
	go kickBall("Emily")
	Sleep(Second * 2)
	ball <- "referee" // kick off

	var c chan bool // nil
	<-c             // blocking here for ever
}