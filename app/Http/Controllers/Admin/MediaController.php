<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MediaUploadRequest;
use App\Models\Media;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/media/index', [
            'media' => Media::query()
                ->latest()
                ->paginate(30)
                ->through(fn (Media $media) => [
                    'id' => $media->id,
                    'url' => $media->url(),
                    'filename' => $media->original_filename,
                    'mime_type' => $media->mime_type,
                    'size' => $media->size,
                    'created_at' => $media->created_at?->toIso8601String(),
                ]),
        ]);
    }

    public function store(MediaUploadRequest $request): RedirectResponse
    {
        $file = $request->file('file');
        $path = $file->store('media', 'public');

        if ($path === false) {
            abort(500, 'Failed to store uploaded file.');
        }

        Media::query()->create([
            'disk' => 'public',
            'path' => $path,
            'filename' => basename($path),
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'uploaded_by' => $request->user()->id,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'File uploaded.']);

        return back();
    }

    public function destroy(Media $media): RedirectResponse
    {
        Storage::disk($media->disk)->delete($media->path);
        $media->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'File deleted.']);

        return back();
    }
}
