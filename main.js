let peerConnection = new RTCPeerConnection();

const dc = peerConnection.createDataChannel('channel');

let createOffer = async () => {
    peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
            document.getElementById('offer-sdp').value = JSON.stringify(peerConnection.localDescription);
        }
    };
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
}
let createAnswer = async () => {
    let offer = JSON.parse(document.getElementById('offer-sdp').value);
    peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
            document.getElementById('answer-sdp').value = JSON.stringify(peerConnection.localDescription);
        }
    };
    await peerConnection.setRemoteDescription(offer);

    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

}

let addAnswer = async () => {
    let answer = JSON.parse(document.getElementById('answer-sdp').value);
    if (!peerConnection.currentRemoteDescription) {
        await peerConnection.setRemoteDescription(answer);
    }
    console.log("Peerovi su se povezali");
    alert("Peerovi su se povezali");
}

let sendFile = () => {

        let fileInput = document.getElementById('choose');
        let file = fileInput.files[0];

        let reader = new FileReader();
        reader.onload = () => {
            let data = reader.result;
            let uniqueId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);

            if (dc.readyState === 'open') {
                dc.send(JSON.stringify({ fileId: uniqueId, fileData: data }));
                console.log('File sent');
                alert("File sent");
            } else {
                console.error('RTCDataChannel is not ready for sending data.');
            }
        };
        reader.readAsDataURL(file);
}

peerConnection.ondatachannel = (event) => {
    const receiveChannel = event.channel;
    receiveChannel.onmessage = (event) => {
        let receivedData = JSON.parse(event.data);
        let fileData = receivedData.fileData;
        let fileName = receivedData.fileName;

        let downloadLink = document.createElement('a');
        downloadLink.href = fileData;
        downloadLink.download = 'Primljen fajl';
        downloadLink.innerHTML = 'Primljen fajl';
        downloadLink.id = 'primljenFajl';
        let li = document.createElement('li');
        li.appendChild(downloadLink);
        document.getElementById('listaFajlova').appendChild(li);

    };
    receiveChannel.onopen = (event) => {
        console.log("Otvoreno povezivanje");
    };
};

document.getElementById('create-offer').addEventListener('click', createOffer);
document.getElementById('create-answer').addEventListener('click', createAnswer);
document.getElementById('add-answer').addEventListener('click', addAnswer);
document.getElementById('send').addEventListener('click', sendFile);
