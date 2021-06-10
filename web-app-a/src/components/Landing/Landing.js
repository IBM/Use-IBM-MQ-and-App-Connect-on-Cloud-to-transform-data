import React from 'react';
import {Table, TableHeader, TableRow, TableBody, TableCell, TableHead} from 'carbon-components-react'
import { Button, Loading, InlineLoading, FormGroup, TextInput } from 'carbon-components-react';
import axios from 'axios'
import ReactJson from 'react-json-view'
import _ from 'lodash'

class Landing extends React.Component {
    constructor(){
        super()
        this.state = {
            headers:[
                {
                    key:"seqNo",
                    header:"Seq. No"
                },
                {
                    key:"messageId",
                    header:"Message ID"
                },
                // {
                //     key:"correlationId",
                //     header:"Correlation ID"
                // },
                {
                    key:"message",
                    header:"Message"
                }
            ],
            seqNo:1,
            data:[],
            loading: false, 
            messageLoading:{}
        }
    }

    componentDidMount = ()=>{
        axios.get(`${window.location.protocol}//${window.location.hostname}:${window.location.port}/getMessageList?q=inputC`).then(async res=>{
            console.log(res.data.data)
            // var msg = res.data.data.messages
            // console.log(msg)
            // var arr = await msg.map(item =>{
            //     item.message = 
            //         <div>
            //             {this.state.messageLoading[item.messageId]?
            //                 <InlineLoading description="Loading..." />
            //                 :
            //                 <Button style={{margin:".5rem"}} onClick={()=>this.getMessage(item.messageId)}>Fetch</Button>
            //             }
            //         </div>
            //     return item
            // })
            // this.setState({data: arr, loading: false})
        })
    }

    handleChange = (e)=>{
        const { name, value } = e.target
        // console.log(name, value)
        this.setState({
            [name]: value
        })
    }

    handleSyncSubmit = (e)=>{

        // let correlationId = _.times(48, () => (Math.random()*0xF<<0).toString(16)).join('');

        e.preventDefault()
        const data = {
            message: { container_num: this.state.input},
            q:"tq2",
            // correlationId: correlationId,
        }

        axios.post(`${window.location.protocol}//${window.location.hostname}:${window.location.port}/postMessage`, data)
        .then(res=>{
            console.log(res.data)
            // alert("Data submitted with submission ID: " + res.data.messageId)
            var arr = this.state.data
            const newData = {
                seqNo: this.state.seqNo,
                messageId: res.data.messageId,
                // correlationId: correlationId,
                message: [
                    <div>
                        {this.state.messageLoading[res.data.messageId]?
                            <InlineLoading description="Loading..." />
                            :
                            <Button style={{margin:".5rem"}} onClick={()=>this.handleFetch(res.data.messageId)}>Fetch</Button>
                        }
                    </div>
                ]
            }
            arr.push(newData)
            this.setState({input:"", seqNo: newData.seqNo+1, data:arr})
        })
    }

    handleFetch = (cid) =>{
        // console.log(this.state.messageLoading)
        // var loadState = this.state.messageLoading
        // loadState[cid] = true
        // console.log(loadState)
        // this.setState({messageLoading: loadState})
        axios.get(`${window.location.protocol}//${window.location.hostname}:${window.location.port}/getMessageFromC?q=outputC&id=${cid}`).then(async res=>{
            console.log(res.data.data)
            var arr = await this.state.data.map(item =>{
                if(item.messageId === cid)
                    if(res.data.data)
                        item.message = JSON.stringify(res.data.data)
                    else
                        alert('No data found')
                return item
            })
        this.setState({data: arr, loading: false})
        })
    }

    render(){
      return (
        this.state.loading?
        <div>
            <Loading
            description="Active loading indicator" withOverlay={false}
            />        
        </div>
          : 
        <div>
            <div>
            <FormGroup legendText="Sync Call" style={{ minWidth: '400px' }}>
                <TextInput
                id="one"
                name="input"
                value={this.state.input}
                labelText="Enter Container Num"
                onChange={this.handleChange}
                placeholder="Enter Container Number"
                style={{ marginBottom: '1rem' }}
                />
                <Button onClick={this.handleSyncSubmit}>Submit</Button>
            </FormGroup>
            </div>
            <div style={{width:"50rem", textAlign:"left"}}>
                {this.state.toDisplay?
                    <ReactJson 
                        src={this.state.toDisplay} 
                        theme="solarized"
                    />
                :
                <></>
                }
            </div>
            {
                this.state.data.length>0?
                <Table>
                    <TableHead>
                        <TableRow>
                        {this.state.headers.map((header) => (
                            <TableHeader key={header.key}>{header.header}</TableHeader>
                        ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.state.data.map((row) => (
                        <TableRow key={row.key}>
                            {Object.keys(row)
                            .map((key) => {
                                // console.log(key)
                                return <TableCell key={key}>{row[key]}</TableCell>;
                            })}
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>           
                :
                <></>
            }
        </div>
      )
    }
};
export default Landing;