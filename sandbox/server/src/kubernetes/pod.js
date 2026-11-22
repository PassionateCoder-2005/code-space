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
            volumes: [
                {
                    name: "workspace-volume",
                    emptyDir: {},
                },
            ],
            initContainers: [
                {
                    name: "init-container",
                    image: "template",
                    imagePullPolicy: "IfNotPresent",
                    command: ["sh", "-c", "cp -r /workspace/. /seed/"],
                    volumeMounts: [
                        {
                            name: "workspace-volume",
                            mountPath: "/seed",
                        },
                    ],
                },
            ],
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
                volumeMounts: [
                    {
                        name: "workspace-volume",
                        mountPath: "/workspace",
                    },
                ],
            },
            {
                 image:"agent",
                 imagePullPolicy:"IfNotPresent",
                 name:"agent-container",
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
                        containerPort: 3000,
                        name: "http",
                    },
                ],
                volumeMounts: [
                    {
                        name: "workspace-volume",
                        mountPath: "/workspace",
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