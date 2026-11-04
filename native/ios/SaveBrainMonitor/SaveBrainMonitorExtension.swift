import DeviceActivity
import FamilyControls
import ManagedSettings

@available(iOS 16.0, *)
class SaveBrainMonitorExtension: DeviceActivityMonitor {
    private let store = ManagedSettingsStore()
    private let activityName = DeviceActivityName("saveBrain.daily")
    private let eventName = DeviceActivityEvent.Name("saveBrain.dailyLimit")

    private func selectedApps() -> FamilyActivitySelection? {
        guard let defaults = UserDefaults(suiteName: "group.com.savebrain.app"),
              let data = defaults.data(forKey: "saveBrain.familyActivitySelection") else {
            return nil
        }
        return try? JSONDecoder().decode(FamilyActivitySelection.self, from: data)
    }

    override func intervalDidStart(for activity: DeviceActivityName) {
        super.intervalDidStart(for: activity)
        guard activity == activityName else { return }
        // A new daily interval starts with a clean shield; the threshold can apply it again.
        store.shield.applications = nil
    }

    override func eventDidReachThreshold(_ event: DeviceActivityEvent.Name, activity: DeviceActivityName) {
        super.eventDidReachThreshold(event, activity: activity)
        guard activity == activityName, event == eventName,
              let selection = selectedApps() else { return }
        store.shield.applications = selection.applicationTokens.isEmpty ? nil : selection.applicationTokens
    }

    override func intervalDidEnd(for activity: DeviceActivityName) {
        super.intervalDidEnd(for: activity)
        guard activity == activityName else { return }
        store.shield.applications = nil
    }
}
