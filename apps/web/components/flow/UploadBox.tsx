"use client";
export default function UploadBox({ name }: { name: string }) {
  return (
    <div className="rounded-xl border p-4">
      <label className="block text-sm font-medium mb-2">Upload supporting document</label>
      <input name={name} type="file" className="block w-full" />
      <p className="mt-2 text-xs text-gray-500">PDF, JPG, or PNG</p>
    </div>
  );
}
