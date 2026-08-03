use std::path::PathBuf;
use tauri::{Emitter, Manager};

pub fn install(builder: tauri::Builder<tauri::Wry>) -> tauri::Builder<tauri::Wry> {
  builder.plugin(tauri_plugin_single_instance::init(|app, args, cwd| {
    let paths = crate::file_open::sci_paths(args, &PathBuf::from(cwd));
    if paths.is_empty() { return; }
    if let Some(window) = app.get_webview_window("main") {
      let _ = window.show();
      let _ = window.unminimize();
      let _ = window.set_focus();
    }
    let _ = app.emit(crate::file_open::OPEN_EVENT, paths);
  }))
}
