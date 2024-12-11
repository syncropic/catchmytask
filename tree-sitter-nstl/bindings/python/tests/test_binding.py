from unittest import TestCase

import tree_sitter, tree_sitter_nstl


class TestLanguage(TestCase):
    def test_can_load_grammar(self):
        try:
            tree_sitter.Language(tree_sitter_nstl.language())
        except Exception:
            self.fail("Error loading Nstl grammar")
