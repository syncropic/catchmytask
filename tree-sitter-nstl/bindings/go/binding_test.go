package tree_sitter_nstl_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_nstl "github.com/tree-sitter/tree-sitter-nstl/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_nstl.Language())
	if language == nil {
		t.Errorf("Error loading Nstl grammar")
	}
}
