function upload() {
    const reader = new FileReader();
    reader.onloadend = function() {
        const ipfs = window.IpfsApi('localhost', 5003) // Connect to IPFS
        const buf = buffer.Buffer(reader.result) // Convert data into buffer
        ipfs.files.add(buf, (err, result) => { // Upload buffer to IPFS
            if(err) {
                console.error(err)
                return
            }
            let url = `https://ipfs.io/ipfs/${result[0].hash}`
            console.log(`Url --> ${url}`)
            document.getElementById("ipfs_hash").value = result[0].hash
            document.getElementById("ipfs_url").href= url
            // document.getElementById("output").src = url
        })
    }
    const photo = document.getElementById("service_prescription_file");
    reader.readAsArrayBuffer(photo.files[0]); // Read Provided File
}
