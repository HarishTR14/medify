import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Pill, Clock, Trash2, Check, BellRing } from "lucide-react";

function App() {
  const [medicines, setMedicines] = useState([]);
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const API = "http://localhost:5000/api/medicines";

  useEffect(() => {
    fetchMedicines();

    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    const interval = setInterval(checkAndNotify, 30000);
    checkAndNotify();
    return () => clearInterval(interval);
  }, []);

  const fetchMedicines = async () => {
    try {
      const res = await axios.get(API);
      setMedicines(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Backend not running?", err);
      setLoading(false);
    }
  };

  const addMedicine = async (e) => {
    e.preventDefault();
    if (!name.trim() || !time) return;

    try {
      await axios.post(API, {
        name: name.trim(),
        time,
        description: desc.trim() || null,
      });
      setName("");
      setTime("");
      setDesc("");
      setShowForm(false);
      fetchMedicines();
    } catch (err) {
      alert("Failed to add. Is backend running on port 5000?");
    }
  };

  const deleteMedicine = async (id) => {
    if (!confirm("Delete this medicine permanently?")) return;
    await axios.delete(`${API}/${id}`);
    fetchMedicines();
  };

  const markTaken = async (id) => {
    await axios.post(`${API}/${id}/take`);
    alert("Marked as taken today!");
  };

  const checkAndNotify = () => {
    if (Notification.permission !== "granted") return;
    const now = new Date().toTimeString().slice(0, 5);

    medicines.forEach((med) => {
      if (med.time.slice(0, 5) === now) {
        new Notification("Time to take your medicine!", {
          body: `${med.name}\n${med.description || "Remember your dose"}`,
          icon: "/pill.png",
          vibrate: [200, 100, 200],
          tag: "med-reminder",
          renotify: true,
        });
        new Audio(
          "https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3"
        )
          .play()
          .catch(() => {});
      }
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Swiss Grid Header */}
      <div className="border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8">
              <h1 className="text-8xl lg:text-9xl font-black tracking-tighter leading-none uppercase">
                Medify
              </h1>
            </div>
            <div className="col-span-12 lg:col-span-4 flex flex-col justify-end">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-600"></div>
                  <span className="text-sm font-mono uppercase tracking-wider">
                    Smart Reminders
                  </span>
                </div>
                <p className="text-base font-mono leading-relaxed">
                  Daily medication tracking with precision timing and
                  notifications
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* Add Button - Swiss Style */}
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-8 right-8 z-50 w-20 h-20 bg-red-600 hover:bg-black text-white flex items-center justify-center transition-colors duration-200"
        >
          <Plus size={40} strokeWidth={3} />
        </button>

        {/* Add Medicine Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
            <div className="bg-white max-w-2xl w-full border-4 border-black">
              <div className="border-b-4 border-black p-8">
                <h2 className="text-5xl font-black tracking-tighter uppercase">
                  New Medicine
                </h2>
              </div>
              <form onSubmit={addMedicine} className="p-8 space-y-6">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider mb-2">
                    Medicine Name
                  </label>
                  <input
                    type="text"
                    placeholder="Aspirin"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-black font-mono focus:outline-none focus:border-red-600"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-black font-mono text-2xl focus:outline-none focus:border-red-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    placeholder="Take with food"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-black font-mono resize-none h-24 focus:outline-none focus:border-red-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-8 py-4 border-2 border-black font-mono uppercase tracking-wider hover:bg-black hover:text-white transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-4 bg-red-600 text-white font-mono uppercase tracking-wider hover:bg-black transition-colors duration-200"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Medicines Grid */}
        {medicines.length === 0 && !loading ? (
          <div className="text-center py-32">
            <div className="w-32 h-32 border-4 border-black mx-auto mb-8 flex items-center justify-center">
              <Pill size={64} className="text-black" />
            </div>
            <p className="text-3xl font-black uppercase tracking-tighter mb-4">
              No Medicines
            </p>
            <p className="text-base font-mono">
              Click the + button to add your first medicine
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {medicines.map((med, index) => (
              <div
                key={med.id}
                className="border-4 border-black hover:border-red-600 transition-colors duration-200"
              >
                <div className="border-b-4 border-black p-6 bg-red-600">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono text-white uppercase tracking-wider">
                      No. {String(index + 1).padStart(2, "0")}
                    </span>
                    <button
                      onClick={() => deleteMedicine(med.id)}
                      className="text-white hover:text-black transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <h3 className="text-3xl font-black tracking-tighter uppercase mt-4 text-white leading-tight">
                    {med.name}
                  </h3>
                </div>

                <div className="p-6 space-y-6">
                  <div className="flex items-baseline gap-3">
                    <Clock size={24} className="flex-shrink-0" />
                    <span className="text-5xl font-black tracking-tighter tabular-nums">
                      {med.time.slice(0, 5)}
                    </span>
                  </div>

                  {med.description && (
                    <p className="text-sm font-mono leading-relaxed border-l-4 border-black pl-4">
                      {med.description}
                    </p>
                  )}

                  <button
                    onClick={() => markTaken(med.id)}
                    className="w-full bg-black text-white py-4 font-mono uppercase tracking-wider hover:bg-red-600 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Check size={20} strokeWidth={3} />
                    Mark Taken
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Grid */}
      <div className="border-t-4 border-black mt-24">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="grid grid-cols-12 gap-8 text-xs font-mono uppercase tracking-wider">
            <div className="col-span-6 lg:col-span-3">
              <div className="w-3 h-3 bg-red-600 mb-2"></div>
              Smart Tracking
            </div>
            <div className="col-span-6 lg:col-span-3">
              <div className="w-3 h-3 bg-black mb-2"></div>
              Daily Reminders
            </div>
            <div className="col-span-6 lg:col-span-3">
              <div className="w-3 h-3 bg-red-600 mb-2"></div>
              Never Miss a Dose
            </div>
            <div className="col-span-6 lg:col-span-3">
              <div className="w-3 h-3 bg-black mb-2"></div>
              Medify 2025
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
