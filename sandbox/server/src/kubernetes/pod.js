import { k8sApi } from "./config.js";

export const createPod=async (sandboxId)=>{
    const podManifest = {
        metadata: {
            name: `sandbox-${sandboxId}`,
            labels: {
                app: "sandbox",
                sandboxId: sandboxId,
            },
        },
        spec: {
            containers: [
                {   
                   image:"template",
                   imagePullPolicy:"IfNotPresent",
                   name:"sandbox-container",
                   resources: {
                    limits: {
                        cpu: "500m",
                        memory: "1Gi",
                    },
                    requests: {
                        cpu: "250m",
                        memory: "500Mi",
                    },
                },
                ports: [
                    {
                        containerPort: 5173,
                        name: "http",
                    },
                ],
            }
            ]
            }
 }
     const response = await k8sApi.createNamespacedPod({
        namespace: "default",
        body: podManifest,
     })
     return response

}