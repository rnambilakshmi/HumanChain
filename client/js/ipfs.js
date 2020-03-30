function upload() {
    document.getElementById("ipfs_err").style.display = "none";
    const reader = new FileReader();
    reader.onloadend = function() {
        try{
            const ipfs = window.IpfsApi('localhost', 5003) // Connect to IPFS
            const buf = buffer.Buffer(reader.result) // Convert data into buffer
            ipfs.files.add(buf, (err, result) => { // Upload buffer to IPFS
                if(err) {
                    console.error(err)
                    document.getElementById("ipfs_err").style.display = "block";
                    return
                }
            let url = `https://ipfs.io/ipfs/${result[0].hash}`
            console.log(`Url --> ${url}`)
            document.getElementById("ipfs_hash").value = result[0].hash
            document.getElementById("ipfs_url").href= url
            })
        }
        catch{
            document.getElementById("ipfs_err").style.display = "block";
        }
        
            // document.getElementById("output").src = url
    }
    const photo = document.getElementById("service_prescription_file");
    reader.readAsArrayBuffer(photo.files[0]); // Read Provided File
}
