import DeviceActivity
import SwiftUI

@main
@available(iOS 16.0, *)
struct SaveBrainReportExtension: DeviceActivityReportExtension {
    var body: some DeviceActivityReportScene {
        SaveBrainTotalActivityReport { reportText in
            SaveBrainTotalActivityView(reportText: reportText)
        }
    }
}

@available(iOS 16.0, *)
extension DeviceActivityReport.Context {
    static let saveBrainTotal = Self("SaveBrain.Total")
}

@available(iOS 16.0, *)
struct SaveBrainTotalActivityReport: DeviceActivityReportScene {
    let context: DeviceActivityReport.Context = .saveBrainTotal
    let content: (String) -> SaveBrainTotalActivityView

    func makeConfiguration(representing data: DeviceActivityResults<DeviceActivityData>) async -> String {
        var totalSeconds: TimeInterval = 0
        var appSeconds: [String: TimeInterval] = [:]
        for await activityData in data {
            for await segment in activityData.activitySegments {
                totalSeconds += segment.totalActivityDuration
                for await category in segment.categories {
                    for await app in category.applications {
                        let name = app.application.localizedDisplayName ?? "이름을 표시할 수 없는 앱"
                        appSeconds[name, default: 0] += app.totalActivityDuration
                    }
                }
            }
        }
        let formatter = DateComponentsFormatter()
        formatter.allowedUnits = [.hour, .minute]
        formatter.unitsStyle = .abbreviated
        formatter.zeroFormattingBehavior = .dropAll
        let totalText = formatter.string(from: totalSeconds) ?? "기록 없음"
        let rows = appSeconds.sorted { $0.value > $1.value }.prefix(12).map { name, seconds in
            "\(name)|\(Int(seconds / 60))"
        }
        return (["TOTAL|\(totalText)"] + rows).joined(separator: "\n")
    }
}

@available(iOS 16.0, *)
struct SaveBrainTotalActivityView: View {
    let reportText: String

    private var totalText: String {
        reportText.split(separator: "\n").first(where: { $0.hasPrefix("TOTAL|") })?.split(separator: "|", maxSplits: 1).last.map(String.init) ?? "기록 없음"
    }

    private var appRows: [(name: String, minutes: String)] {
        reportText.split(separator: "\n").compactMap { line in
            let parts = line.split(separator: "|", maxSplits: 1).map(String.init)
            guard parts.count == 2, parts[0] != "TOTAL" else { return nil }
            return (name: parts[0], minutes: parts[1])
        }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                Text("선택한 앱의 오늘 사용 시간")
                    .font(.headline)
                Text(totalText)
                    .font(.system(size: 29, weight: .bold, design: .rounded))
                    .foregroundStyle(Color(red: 0.45, green: 0.32, blue: 0.22))
                if appRows.isEmpty {
                    Text("표시할 사용 기록이 없습니다. 선택한 앱을 사용한 뒤 다시 확인해 주세요.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                } else {
                    ForEach(Array(appRows.enumerated()), id: \.offset) { _, row in
                        HStack {
                            Text(row.name).lineLimit(1)
                            Spacer()
                            Text("\(row.minutes)분").bold()
                        }
                        .font(.subheadline)
                        Divider()
                    }
                }
                Text("기기에서 집계된 앱 사용 시간입니다. 앱 이름과 시간은 iOS가 제공하는 개인정보 보호 리포트 안에서 표시됩니다.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
            .padding(18)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color(red: 0.97, green: 0.94, blue: 0.90))
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
    }
}
