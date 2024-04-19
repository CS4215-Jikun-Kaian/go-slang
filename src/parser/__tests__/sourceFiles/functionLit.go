package samples
func main() {
	go func(x, y int) int { return x + y }(1, 2)
}