mod file_open;
mod single_instance;

use std::sync::Mutex;
use serde::Serialize;
use tauri::Manager;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SciReadResult { path: String, bytes: Vec<u8> }

struct PendingSciFiles(Mutex<Vec<String>>);

#[tauri::command]
fn take_pending_sci_files(state: tauri::State<PendingSciFiles>) -> Vec<String> {
  std::mem::take(&mut *state.0.lock().expect("pending SCI file mutex poisoned"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let initial = file_open::sci_paths(std::env::args(), &std::env::current_dir().unwrap_or_default());
  let builder = tauri::Builder::default().manage(PendingSciFiles(Mutex::new(initial)));
  single_instance::install(builder)
    .invoke_handler(tauri::generate_handler![file_open::read_sci_file, file_open::write_sci_file, take_pending_sci_files])
    .run(tauri::generate_context!())
    .expect("error while running PressCraft");
}
