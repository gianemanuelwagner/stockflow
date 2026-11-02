import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, Trash2 } from "lucide-react";
import { prepareImage } from "./images";

export default function ImagePicker({
  value,
  onChange,
  onBusy,
  avatar = false,
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      onBusy(false);
    };
  }, [onBusy]);
  async function choose(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    setLoading(true);
    onBusy(true);
    try {
      const image = await prepareImage(file);
      if (mounted.current) onChange(image);
    } catch (e) {
      if (mounted.current) setError(e.message || "No pudimos leer esa imagen.");
    } finally {
      if (mounted.current) {
        setLoading(false);
        onBusy(false);
      }
    }
  }
  return (
    <div className="image-picker">
      <div className={"image-preview " + (avatar ? "round" : "")}>
        {value ? (
          <img
            src={value}
            alt={
              avatar ? "Vista previa de tu foto" : "Vista previa del producto"
            }
          />
        ) : avatar ? (
          <Camera size={28} />
        ) : (
          <ImagePlus size={28} />
        )}
      </div>
      <div className="image-picker-controls">
        <label className="upload-button">
          {loading
            ? "Preparando imagen…"
            : avatar
              ? "Elegir foto de perfil"
              : "Elegir imagen del producto"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={choose}
            disabled={loading}
          />
        </label>
        <p>JPG, PNG o WebP · Hasta 8 MB. Se optimiza antes de guardar.</p>
        {value && (
          <button
            type="button"
            className="remove-image"
            disabled={loading}
            onClick={() => onChange("")}
          >
            <Trash2 size={14} />
            Quitar imagen
          </button>
        )}
        {error && (
          <p className="image-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
