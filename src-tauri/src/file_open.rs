use std::{fs, path::{Path, PathBuf}};

pub const OPEN_EVENT: &str = "presscraft://open-sci-files";

pub fn sci_paths<I>(arguments: I, cwd: &Path) -> Vec<String>
where I: IntoIterator<Item = String> {
  arguments.into_iter().skip(1).filter_map(|argument| {
    if !argument.to_lowercase().ends_with(".sci") { return None; }
    let path = PathBuf::from(argument);
    let absolute = if path.is_absolute() { path } else { cwd.join(path) };
    Some(absolute.to_string_lossy().into_owned())
  }).collect()
}

#[tauri::command]
pub fn read_sci_file(path: String, max_bytes: u64) -> Result<super::SciReadResult, String> {
  let requested = PathBuf::from(&path);
  if !requested.extension().is_some_and(|ext| ext.eq_ignore_ascii_case("sci")) {
    return Err("INVALID_EXTENSION".into());
  }
  let metadata = fs::metadata(&requested).map_err(|error| match error.kind() {
    std::io::ErrorKind::PermissionDenied => "NOT_READABLE".to_string(), _ => "NOT_A_FILE".to_string()
  })?;
  if !metadata.is_file() { return Err("NOT_A_FILE".into()); }
  if metadata.len() > max_bytes { return Err("FILE_TOO_LARGE".into()); }
  let canonical = requested.canonicalize().map_err(|_| "NOT_READABLE".to_string())?;
  let bytes = fs::read(&canonical).map_err(|_| "NOT_READABLE".to_string())?;
  Ok(super::SciReadResult { path: canonical.to_string_lossy().into_owned(), bytes })
}

#[tauri::command]
pub fn write_sci_file(path: String, contents: String) -> Result<String, String> {
  let requested = PathBuf::from(path);
  if !requested.extension().is_some_and(|ext| ext.eq_ignore_ascii_case("sci")) { return Err("INVALID_EXTENSION".into()); }
  fs::write(&requested, contents.as_bytes()).map_err(|_| "NOT_WRITABLE".to_string())?;
  Ok(requested.canonicalize().unwrap_or(requested).to_string_lossy().into_owned())
}
