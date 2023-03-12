document.addEventListener("DOMContentLoaded", () => {


  // description message
  const msgContainer = document.querySelector('.description');
  const msg = document.querySelector('.msg');

  // select with chips
  const chips = document.querySelector('select[name="chip"]');

  // select with firmware 
  const firmware = document.querySelector('select[name="firmware"]');

  let unsupported = false;



  firmware.addEventListener("change", (e) => {
    const button = document.querySelector('.select-wrapper').querySelector('esp-web-install-button');
    button.manifest = `manifest/${e.target.value}.manifest.json`;
    addManifestInfo(e.target.value)
  });

  chips.addEventListener("change", (e) => {
    const button = document.querySelector('.select-wrapper').querySelector('esp-web-install-button');
    button.classList.add('ready');
  });


  // displaying all needed information
  const addManifestInfo = async (manifest) => {

    const manifestJSON = await fetch(`../manifest/${manifest}.manifest.json`)
    const manifestResult = await manifestJSON.json();

    chips.innerHTML = `<option class="placeholder" value="" disabled selected>Select chip</option>`;
    chips.style.display="block"
    document.querySelector('.select-wrapper').querySelector('esp-web-install-button').classList.remove('ready')

    // adding chip options
    const options = manifestResult.builds;
    if(options.length) {
      options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.chipFamily;
        opt.innerHTML = option.chipFamily;
        chips.appendChild(opt);
      })
    } else {
      document.querySelector('.select-wrapper').querySelector('esp-web-install-button').classList.add('ready')
      chips.style.display="none";
    }

    // display information above selects
    const descr = manifestResult.description;

    msg.classList.remove('invisible');


    if(!unsupported) {

      msgContainer.innerText = descr;

      // if need to add some specific styling or additional tag to specific manifest
      if(manifest === 'airrohr-firmware_en') {
        const a = document.createElement('a');
        a.innerText = 'Read article on wiki';
        a.href = "#"
        msgContainer.append(a)
      }

      
    }
 
  }

  const checkSupport = () => {
    const btn = msg.querySelector('esp-web-install-button');
    const btnAttrs = btn.getAttributeNames();


    btnAttrs.map(attr => {
      if(attr === 'install-unsupported') {
        unsupported = true;

        chips.setAttribute('disabled', true)
        firmware.setAttribute('disabled', true)
        msg.classList.add('unsupported')
        msg.classList.remove('invisible')
        btn.classList.remove('invisible');
        document.querySelector('.btn-unsupported').style.display = 'block';
      }
    })
  }


  // custom scroll bar initialization
  new SimpleBar(document.getElementById('customBar'), {
    autoHide: false,
  });

  checkSupport();

})