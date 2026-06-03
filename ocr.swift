import AppKit
import Foundation
import Vision

guard CommandLine.arguments.count >= 2 else {
  fputs("Usage: swift ocr.swift <image-path>\n", stderr)
  exit(2)
}

let imageURL = URL(fileURLWithPath: CommandLine.arguments[1])

guard let image = NSImage(contentsOf: imageURL) else {
  fputs("이미지 파일을 열 수 없습니다.\n", stderr)
  exit(3)
}

var proposedRect = CGRect(origin: .zero, size: image.size)
guard let cgImage = image.cgImage(forProposedRect: &proposedRect, context: nil, hints: nil) else {
  fputs("이미지를 OCR 가능한 형식으로 변환하지 못했습니다.\n", stderr)
  exit(4)
}

let request = VNRecognizeTextRequest()
request.recognitionLevel = .accurate
request.usesLanguageCorrection = true
request.recognitionLanguages = ["ko-KR", "en-US"]

let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])

do {
  try handler.perform([request])
  let lines = (request.results ?? []).compactMap { observation in
    observation.topCandidates(1).first?.string
  }
  print(lines.joined(separator: "\n"))
} catch {
  fputs("OCR 실행 중 오류가 발생했습니다: \(error.localizedDescription)\n", stderr)
  exit(5)
}
