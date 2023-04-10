using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using OpenCvSharp;
using OpenCvSharp.Features2D;

public class CameraSetup : MonoBehaviour
{
   WebCamTexture _webcamTexture; // Webcamtexture for the access to the camera picture
   public RawImage _display;  // RawImage for the display of the camera picture
                              // CascadeClassifier _cascadeClassifier; // Cascade classifier for the face detection
                              // OpenCvSharp.Rect face; // Face rectangle

   public Texture2D objectImage;
   private Mat objectDescriptors;
   private ORB orbDetector;   
   private BFMatcher matcher;

   public void Start()
   {
      // starting with the camera setup
      WebCamDevice[] devices = WebCamTexture.devices; // Get all the available cameras
      _webcamTexture = new WebCamTexture(devices[0].name); // Use the first camera

      // initializing the ORB detector and the BFMatcher
      orbDetector = ORB.Create(); // Create a new ORB detector
      matcher = new BFMatcher(NormTypes.hamming); // Create a new BFMatcher for the matching of the descriptors

      // convert the textrure2d image to a openCV mat object
      objectDescriptors = new Mat();
      Utils.texture2DtoMat(objectImage, objectDescriptors); // Convert the texture to a Mat object

      // SwitchCamera(); // Start the camera
   }

   public void SwitchCamera()
   {
      Debug.Log("Switching camera");
      if (_webcamTexture.isPlaying)
      {
         _webcamTexture.Stop();
      }
      else
      {
         _webcamTexture.Play();
         // _cascadeClassifier = new CascadeClassifier(Application.dataPath + @"/OpenCV+Unity/Demo/Face_Detector/haarcascade_frontalface_default.xml"); // Load the cascade classifier
         // a cascade classifier is a machine learning object detection algorithm, it is trained with a lot of positive and negative images. if all the features of the classifier are matched with the features of the image, the classifier will detect the object in the image.
      }
   }

   // Update is called once per frame
   void Update()
   {
      if (!_webcamTexture.isPlaying) return; // If the camera is not running, do nothing
      _display.texture = _webcamTexture; // Display the camera picture on the RawImage (The RawImage is a component of the UI system in Unity)
                                         // Mat frame = OpenCvSharp.Unity.TextureToMat(_webcamTexture); // Convert the camera picture to a Mat object
                                         // findNewFace(frame); // Find a face in the picture
                                         // display(frame); // Display the face on the picture
                                         // }

      // void findNewFace(Mat frame)
      // {
      // var faces = _cascadeClassifier.DetectMultiScale(frame, 1.1, 3, HaarDetectionType.ScaleImage); // _cascadeClassifier.DetectMultiScale returns an array of rectangles, each rectangle is a face
      // frame is the video frame in which the faces should be detected
      // 1.1 is the scale factor
      // 2 is the minimum number of neighbors which should be detected for each candidate rectangle. The higher this value, the more false positives you get.
      // if (faces.Length >= 1)
      // {
      //    Debug.Log(faces[0].Location);
      //    face = faces[0];
   }
   // }

   // void display(Mat frame)
   // {
   //    if (face != null)
   //    {
   //       frame.Rectangle(face, new Scalar(255, 0, 255), 2); // Draw a rectangle around the face
   //    }
   //    Texture newTexture = OpenCvSharp.Unity.MatToTexture(frame);
   //    _display.texture = newTexture;
   // }
}
