
using System;
/// Verso Networking Library
/// v1.0.0.4
/// 
/// Websockets demo
/// 
using UnityEngine;
using UnityEngine.UI;
using Verso;
using Verso.Protocols.Websockets;

public class WebsocketDemo : MonoBehaviour
{

    public Terrain terrain;

    private WebsocketClient websocketClient;

    private int messageIndex = 0;

    public int minCount = 40;

    private int counter = 0;

    void Start()
    {
        Debug.Log("connecting...");
        websocketClient = new WebsocketClient();
        websocketClient.OnConnected += WebsocketClient_OnConnected;
        websocketClient.OnError += WebsocketClient_OnError;
        websocketClient.Open("ws://192.168.178.236:9000");
    }

    private void WebsocketClient_OnError(string error)
    {
        Debug.Log("Error in client" + error);
    }

    private void WebsocketClient_OnConnected(WebsocketConnection websocketConnection)
    {
        Debug.Log("connected");
        websocketConnection.OnBinaryMessage += WebsocketConnection_OnBinaryMessage;
        websocketConnection.OnError += WebsocketConnection_OnError;
        websocketConnection.OnWebsocketConnectionClosed += WebsocketConnection_OnWebsocketConnectionClosed;
    }

    private void WebsocketConnection_OnBinaryMessage(WebsocketConnection websocket, byte[] message)
    {
        if (counter == 0) {
            var heightMap = new float[message.Length / 4];
            Buffer.BlockCopy(message, 0, heightMap, 0, message.Length);
            var heightMap2d = new float[513, 513];
            for (int y = 0; y < 480; y++)
            {
                for (int x = 0; x < 513; x++)
                {

                    heightMap2d[x, y] = (1 - (heightMap[y * 640 + x] / 1000)) * 1.2f;
                }
            }

            terrain.terrainData.SetHeights(0, 0, heightMap2d);
            counter = 0;
        }
        else
        {

            if (counter > minCount)
                counter = 0;
        }
        counter++;
    
    }


    private void WebsocketConnection_OnWebsocketConnectionClosed(WebsocketConnection websocket)
    {
        Debug.Log("Websocket connection closed");
    }

    private void WebsocketConnection_OnError(WebsocketConnection websocket, string error)
    {
        Debug.Log("Error in websocket connection: " + error);
    }


    void Update()
    {
        TaskManager.ProcessPendingTasks();
    }

    void OnApplicationQuit()
    {
        if (websocketClient != null)
            websocketClient.Close();
    }
}