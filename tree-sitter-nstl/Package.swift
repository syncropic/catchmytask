// swift-tools-version:5.3
import PackageDescription

let package = Package(
    name: "TreeSitterNstl",
    products: [
        .library(name: "TreeSitterNstl", targets: ["TreeSitterNstl"]),
    ],
    dependencies: [
        .package(url: "https://github.com/ChimeHQ/SwiftTreeSitter", from: "0.8.0"),
    ],
    targets: [
        .target(
            name: "TreeSitterNstl",
            dependencies: [],
            path: ".",
            sources: [
                "src/parser.c",
                // NOTE: if your language has an external scanner, add it here.
            ],
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterNstlTests",
            dependencies: [
                "SwiftTreeSitter",
                "TreeSitterNstl",
            ],
            path: "bindings/swift/TreeSitterNstlTests"
        )
    ],
    cLanguageStandard: .c11
)
