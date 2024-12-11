import XCTest
import SwiftTreeSitter
import TreeSitterNstl

final class TreeSitterNstlTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_nstl())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Nstl grammar")
    }
}
