using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class CameraSetup : MonoBehaviour
{
   int currentCamIndex = 0;
   WebCamTexture webcamTexture; // Webcamtexture for the access to the camera picture
   public RawImage display;

   public void SwapCam()
   {

   }
   public void SwitchCam()
   {
      if (webcamTexture != null)
      {
         display.texture = null;
         webcamTexture.Stop();
         webcamTexture = null;
      }
      else
      {
         WebCamDevice device = WebCamTexture.devices[0];
         webcamTexture = new WebCamTexture(device.name);
         display.texture = webcamTexture;

         webcamTexture.Play();
      }

   }
   //    public MeshRenderer displayRenderer; // The renderer that will display the camera's output

   //    // Start is called before the first frame update
   //    void Start()
   //    {
   //       // search for available cameras
   //       WebCamDevice[] devices = WebCamTexture.devices;

   //       if (devices.Length == 0)
   //       {
   //          Debug.Log("No camera detected");
   //          return;
   //       }

   //       // use the first camera
   //       string cameraName = devices[0].name;
   //       webcamTexture = new WebCamTexture(cameraName, 1280, 720, 30);

   //       // assign the webcamtexture to the meshrenderer, so it can be displayed
   //       displayRenderer.material.mainTexture = webcamTexture;
   //    }

   //    void onDestroy()
   //    {
   //       if (webcamTexture != null)
   //       {
   //          webcamTexture.Stop();
   //       }
   //    }

   //    // Update is called once per frame
   //    void Update()
   //    {

   //    }
}
