import { AxiosInstance } from "axios";
import { formatDate, formatIpfsData } from "../../commands/info";
import provideGetFromIpfs, { GetFromIpfs, IpfsData, IpfsManifestData } from "./get.from.ipfs";

const mockIpfsData = {
    "manifest":{
       "from":"0x123456",
       "name":"Compound Liquidatable Positions Monitor",
       "agentId":"Compound Liquidatable Positions Monitor",
       "agentIdHash":"0x3c61101f1d349661298a58ba59a58fbce5a3626c5c7af10b091796969e0d6c59",
       "version":"0.0.1",
       "timestamp":"Fri, 20 May 2022 15:54:56 GMT",
       "imageReference":"bafybeib5kmox5r2wpre3tgkfgfr76tm4qascagmqvod2wcojxrqmgyxfp4@sha256:2fcfede6f821f4f14e745598fd71b2201471517acd345f7b8f0cd424d35b441a",
       "documentation":"QmQXZvBdZ4eMtCefNXYMRwQ7UJbgW74EqrMv9wS9hoSXV7",
       "repository":"https://github.com/arbitraryexecution/compound-monitoring/tree/main/liquidation-monitor",
       "projects":[
          "compound_v2"
       ],
       "chainIds":[
          1
       ],
       "publishedFrom":"Forta Explorer 0.0.2"
    } as IpfsManifestData
}


describe("getFromIpfs", () => {
    let getFromIpfs: GetFromIpfs;

    const mockIpfsClient = jest.genMockFromModule('axios');
    const botId = "0x123";

    //@ts-ignore
    mockIpfsClient.create = jest.fn(() => mockIpfsClient)


    const resetMocks = () => {
        //@ts-ignore
        mockIpfsClient.create.mockReset()
    }

    beforeEach(() => resetMocks())

    beforeAll(() => {
        getFromIpfs = provideGetFromIpfs(mockIpfsClient as AxiosInstance, botId)
    })

    it("correctly formats Ipfs data in enabled state", async () => {
        const dataManifest = mockIpfsData.manifest
        const formattedData = formatIpfsData(dataManifest, true);

        const correctFormat = {
            name: dataManifest.name,
            agentId: dataManifest.agentIdHash,
            status: "Enabled",
            version: dataManifest.version,
            owner: dataManifest.from,
            image: dataManifest.imageReference,
            publishedFrom: dataManifest.publishedFrom,
            timestamp: formatDate(new Date(dataManifest.timestamp)),
            documentation: ` https://ipfs.io/ipfs/${dataManifest.documentation}`
        }

        expect(formattedData).toEqual(correctFormat)
    })

    it("returns ipfs manifest", async () => {
        //@ts-ignore
        mockIpfsClient.mockReturnValueOnce({ data: mockIpfsData})
        const data = await getFromIpfs("12345")
        expect(data).toEqual(mockIpfsData)
    })

    it("notifies user that no ipfs data found for given botId", async () => {
        const metaHash = "12345"
        try {
            //@ts-ignore
            mockIpfsClient.mockImplementation(() => {
                const error = new Error('Error status code 403');
                //@ts-ignore
                error.response = { status: 403 };
                throw error;
              });
            await getFromIpfs(metaHash)
        } catch(e) {
            expect(e.message).toBe(`Unable to find ipfs data for bot id: ${botId}. Please verify your bot has been deployed at https://explorer.forta.network/ `)
        }
    })

    it("throws an error if no data found for given ipfs hash", async () => {
        const metaHash = "12345"
        try {
            //@ts-ignore
            mockIpfsClient.mockReturnValueOnce({data: undefined})
            await getFromIpfs(metaHash)
        } catch(e) {
            expect(e.message).toBe(`No data found for ipfs hash ${metaHash}`)
        }
    })
})