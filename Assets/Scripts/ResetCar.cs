using UnityEngine;
using System.Collections;

public class ResetCar : MonoBehaviour
{
    public Transform car;

    // Use this for initialization
    void Start()
    {

    }

    // Update is called once per frame
    void Update()
    {
        if (Input.GetKeyDown(KeyCode.R))
        {
            car.rotation = Quaternion.identity;
            car.Translate(new Vector3(0, 10, 0));
        }

    }
}
