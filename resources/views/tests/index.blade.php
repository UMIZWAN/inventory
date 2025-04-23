@extends('app')

@section('content')
<div class="container">
    <h1 class="mb-4">Asset List</h1>
    <div id="asset-list" class="row">
        <!-- Assets will be loaded here -->
    </div>
</div>
@endsection

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function () {
    fetch('http://127.0.0.1:8000/api/assets')
        .then(response => response.json())
        .then(result => {
            const container = document.getElementById('asset-list');

            if (result.success && result.data.length > 0) {
                result.data.forEach(asset => {
                    const remarks = asset.assets_remark.map(r => `<li>${r}</li>`).join('');
                    const logs = asset.assets_log.map(l => `<li>${l}</li>`).join('');

                    const imageHtml = asset.asset_image 
                        ? `<img src="/storage/${asset.asset_image}" class="img-fluid mb-3" width="200">` 
                        : '';

                    container.innerHTML += `
                        <div class="col-md-6">
                            <div class="card mb-4">
                                <div class="card-header">
                                    <h5>${asset.name} (${asset.asset_type})</h5>
                                </div>
                                <div class="card-body">
                                    ${imageHtml}
                                    <p><strong>Running Number:</strong> ${asset.asset_running_number}</p>
                                    <p><strong>Category ID:</strong> ${asset.asset_category_id}</p>
                                    <p><strong>Tag ID:</strong> ${asset.asset_tag_id}</p>
                                    <p><strong>Stable Value:</strong> $${parseFloat(asset.asset_stable_value).toFixed(2)}</p>
                                    <p><strong>Current Value:</strong> $${parseFloat(asset.asset_current_value).toFixed(2)}</p>
                                    <p><strong>Branch ID:</strong> ${asset.assets_branch_id}</p>
                                    <p><strong>Location:</strong> ${asset.assets_location}</p>
                                    <p><strong>Remarks:</strong><ul>${remarks}</ul></p>
                                    <p><strong>Logs:</strong><ul>${logs}</ul></p>
                                    <p><strong>Created At:</strong> ${new Date(asset.created_at).toLocaleString()}</p>
                                    <p><strong>Updated At:</strong> ${new Date(asset.updated_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    `;
                });
            } else {
                container.innerHTML = '<p>No assets found.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching assets:', error);
            document.getElementById('asset-list').innerHTML = '<p class="text-danger">Failed to load assets.</p>';
        });
});
</script>
@endpush
