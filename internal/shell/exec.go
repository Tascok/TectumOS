package shell

import (
	"bytes"
	"context"
	"fmt"
	"os/exec"
	"time"
)

// ExecResult contains the output of a command execution.
type ExecResult struct {
	Stdout   string
	Stderr   string
	ExitCode int
}

// Exec runs a command with a timeout and returns the result.
func Exec(timeout time.Duration, name string, args ...string) (*ExecResult, error) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, name, args...)

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()

	result := &ExecResult{
		Stdout: stdout.String(),
		Stderr: stderr.String(),
	}

	if err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			result.ExitCode = exitErr.ExitCode()
		} else if ctx.Err() == context.DeadlineExceeded {
			return result, fmt.Errorf("command timed out after %v", timeout)
		} else {
			return result, err
		}
	}

	return result, nil
}

// ExecSimple runs a command and returns stdout only.
func ExecSimple(name string, args ...string) (string, error) {
	result, err := Exec(30*time.Second, name, args...)
	if err != nil {
		return "", err
	}
	if result.ExitCode != 0 {
		return "", fmt.Errorf("command exited with code %d: %s", result.ExitCode, result.Stderr)
	}
	return result.Stdout, nil
}
