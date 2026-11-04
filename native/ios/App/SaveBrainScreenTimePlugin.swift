import UIKit
import SwiftUI
import Capacitor
import FamilyControls
import DeviceActivity
import ManagedSettings

@available(iOS 16.0, *)
@objc(SaveBrainScreenTimePlugin)
public class SaveBrainScreenTimePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SaveBrainScreenTimePlugin"
    public let jsName = "SaveBrainScreenTime"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "checkStatus", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "selectApps", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startLimit", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopLimit", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showUsageReport", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestUsageAccess", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestFocusAccess", returnType: CAPPluginReturnPromise)
    ]

    private let activityName = DeviceActivityName("saveBrain.daily")
    private let eventName = DeviceActivityEvent.Name("saveBrain.dailyLimit")
    private let settingsStore = ManagedSettingsStore()
    private let activityCenter = DeviceActivityCenter()

    private var sharedDefaults: UserDefaults? {
        UserDefaults(suiteName: SaveBrainAppGroup.identifier)
    }

    private var isFamilyControlsAuthorized: Bool {
        let status = AuthorizationCenter.shared.authorizationStatus
        if status == .approved { return true }
        if #available(iOS 26.0, *), status == .approvedWithDataAccess { return true }
        return false
    }

    private func savedSelection() -> FamilyActivitySelection? {
        guard let data = sharedDefaults?.data(forKey: SaveBrainAppGroup.selectionKey) else { return nil }
        return try? JSONDecoder().decode(FamilyActivitySelection.self, from: data)
    }

    @objc public func checkStatus(_ call: CAPPluginCall) {
        let authorized = isFamilyControlsAuthorized
        let selection = savedSelection()
        let prefs = sharedDefaults
        call.resolve([
            "platform": "ios",
            "authorized": authorized,
            "usageAccess": authorized,
            "focusAccess": authorized,
            "selectedCount": selection?.applicationTokens.count ?? 0,
            "limitMinutes": prefs?.integer(forKey: "saveBrain.limitMinutes") ?? 0,
            "focusEnabled": prefs?.bool(forKey: "saveBrain.focusEnabled") ?? false
        ])
    }

    @objc public func requestAuthorization(_ call: CAPPluginCall) {
        Task { @MainActor in
            do {
                try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
                let approved = isFamilyControlsAuthorized
                call.resolve(["authorized": approved])
            } catch {
                call.reject("Screen Time 권한을 허용하지 못했습니다: \(error.localizedDescription)")
            }
        }
    }

    @objc public func selectApps(_ call: CAPPluginCall) {
        guard isFamilyControlsAuthorized else {
            call.reject("먼저 Screen Time 권한을 허용해 주세요.")
            return
        }
        DispatchQueue.main.async {
            let sheet = SaveBrainFamilyActivityPicker { [weak self] selection in
                guard let self else { return }
                do {
                    let data = try JSONEncoder().encode(selection)
                    guard let defaults = self.sharedDefaults else {
                        call.reject("App Group 저장소를 찾지 못했습니다. Xcode의 App Groups 설정을 확인해 주세요.")
                        return
                    }
                    defaults.set(data, forKey: SaveBrainAppGroup.selectionKey)
                    let count = selection.applicationTokens.count
                    call.resolve(["selectedCount": count])
                } catch {
                    call.reject("선택한 앱을 저장하지 못했습니다: \(error.localizedDescription)")
                }
            }
            let controller = UIHostingController(rootView: sheet)
            controller.modalPresentationStyle = .pageSheet
            self.bridge?.viewController?.present(controller, animated: true)
        }
    }

    @objc public func startLimit(_ call: CAPPluginCall) {
        guard isFamilyControlsAuthorized else {
            call.reject("먼저 Screen Time 권한을 허용해 주세요.")
            return
        }
        guard let selection = savedSelection(), !selection.applicationTokens.isEmpty else {
            call.reject("먼저 제한할 앱을 선택해 주세요.")
            return
        }
        let minutes = call.getInt("minutes") ?? 30
        guard (1...720).contains(minutes) else {
            call.reject("하루 한도는 1~720분 사이로 설정해 주세요.")
            return
        }

        let schedule = DeviceActivitySchedule(
            intervalStart: DateComponents(hour: 0, minute: 0),
            intervalEnd: DateComponents(hour: 23, minute: 59),
            repeats: true
        )
        let event = DeviceActivityEvent(
            applications: selection.applicationTokens,
            threshold: DateComponents(minute: minutes),
            includesPastActivity: true
        )

        do {
            try activityCenter.startMonitoring(activityName, during: schedule, events: [eventName: event])
            sharedDefaults?.set(minutes, forKey: "saveBrain.limitMinutes")
            sharedDefaults?.set(true, forKey: "saveBrain.focusEnabled")
            call.resolve(["enabled": true, "limitMinutes": minutes, "selectedCount": selection.applicationTokens.count])
        } catch {
            call.reject("집중 모니터링을 시작하지 못했습니다: \(error.localizedDescription)")
        }
    }

    @objc public func stopLimit(_ call: CAPPluginCall) {
        activityCenter.stopMonitoring([activityName])
        settingsStore.shield.applications = nil
        sharedDefaults?.set(false, forKey: "saveBrain.focusEnabled")
        call.resolve(["enabled": false])
    }

    @objc public func showUsageReport(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let controller = UIHostingController(rootView: SaveBrainUsageReportScreen())
            controller.modalPresentationStyle = .pageSheet
            self.bridge?.viewController?.present(controller, animated: true) {
                call.resolve(["presented": true])
            }
        }
    }

    // iOS uses FamilyControls authorization for both usage reporting and app shielding.
    @objc public func requestUsageAccess(_ call: CAPPluginCall) {
        requestAuthorization(call)
    }

    @objc public func requestFocusAccess(_ call: CAPPluginCall) {
        requestAuthorization(call)
    }
}

@available(iOS 16.0, *)
private struct SaveBrainFamilyActivityPicker: View {
    @Environment(\.dismiss) private var dismiss
    @State private var selection = FamilyActivitySelection()
    let onSave: (FamilyActivitySelection) -> Void

    var body: some View {
        NavigationStack {
            VStack(spacing: 12) {
                Text("사용을 조절할 앱을 선택하세요.")
                    .font(.headline)
                Text("선택한 앱만 하루 한도 관리에 포함됩니다.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                FamilyActivityPicker(selection: $selection)
            }
            .padding(.top, 12)
            .navigationTitle("앱 선택")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("취소") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("선택 완료") {
                        onSave(selection)
                        dismiss()
                    }
                }
            }
        }
    }
}

@available(iOS 16.0, *)
private struct SaveBrainUsageReportScreen: View {
    @Environment(\.dismiss) private var dismiss

    private var today: DateInterval {
        Calendar.current.dateInterval(of: .day, for: .now) ?? DateInterval(start: .now, duration: 86_400)
    }

    private var selectedApplicationTokens: Set<ApplicationToken> {
        guard let data = UserDefaults(suiteName: SaveBrainAppGroup.identifier)?.data(forKey: SaveBrainAppGroup.selectionKey),
              let selection = try? JSONDecoder().decode(FamilyActivitySelection.self, from: data) else {
            return []
        }
        return selection.applicationTokens
    }

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 14) {
                Text("오늘의 기기 사용 시간")
                    .font(.title2.bold())
                Text("아래 리포트는 iOS가 제공하는 화면 시간 집계입니다. 원본 앱 사용 기록을 웹 코드로 직접 읽어 보내지 않습니다.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                DeviceActivityReport(
                    DeviceActivityReport.Context("SaveBrain.Total"),
                    filter: DeviceActivityFilter(
                        segment: .daily(during: today),
                        applications: selectedApplicationTokens
                    )
                )
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
            .padding()
            .navigationTitle("사용 시간")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("닫기") { dismiss() }
                }
            }
        }
    }
}
