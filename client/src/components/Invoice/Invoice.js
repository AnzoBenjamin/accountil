import React, { useState, useEffect, useCallback} from 'react'
import styles from './Invoice.module.css'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import { useHistory } from 'react-router-dom'
import { toCommas } from '../../utils/utils'

import IconButton from '@material-ui/core/IconButton';
import DeleteOutlineRoundedIcon from '@material-ui/icons/DeleteOutlineRounded';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import { Container, Grid } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import SaveIcon from '@material-ui/icons/Save';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import {initialState} from '../../initialState'
import currencies from '../../currencies.json'
import { createInvoice, getInvoice, updateInvoice } from '../../actions/invoiceActions';
import { getClientsByUser } from '../../actions/clientActions'
import AddClient from './AddClient';
import InvoiceType from './InvoiceType';
import axios from 'axios'
import { getInventoryByUser } from '../../actions/inventoryActions';

const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      '& > *': {
        margin: theme.spacing(1),
      },
    },
    large: {
      width: theme.spacing(12),
      height: theme.spacing(12),
    },
    table: {
        minWidth: 650,
      },

    headerContainer: {
        // display: 'flex'
        paddingTop: theme.spacing(1),
        paddingLeft: theme.spacing(5),
        paddingRight: theme.spacing(1),
    }
  }));

const Invoice = () => {

    const [invoiceData, setInvoiceData] = useState(initialState)
    const [ rates, setRates] = useState(0)
    const [vat, setVat] = useState(0)
    const [currency, setCurrency] = useState(currencies[0].value)
    const [subTotal, setSubTotal] = useState(0)
    const [total, setTotal] = useState(0)
    const today = new Date();
    const [selectedDate, setSelectedDate] = useState(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const [ client, setClient] = useState(null)
    const [type, setType] = useState('Invoice')
    const [status, setStatus ] = useState('')
    const { id } = useParams()
    const clients = useSelector((state) => state.clients.clients)
    const { invoice } = useSelector((state) => state.invoices);
    const dispatch = useDispatch()
    const history = useHistory()
    const user = JSON.parse(localStorage.getItem('profile'))
    const [availableItems, setAvailableItems] = useState([]);
    const rows = useSelector(state => state.invoices.invoices)
    const { inventoryItems, inventoryItem } = useSelector(
      (state) => state.inventory
    ); // Use Redux state for inventory
    const getTotalCount = useCallback(async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API}/invoices/count?searchQuery=${user?.result?._id}`);
        setInvoiceData(prevData => ({ 
          ...prevData, 
          invoiceNumber: (Number(response.data) + 1).toString().padStart(3, '0')
        }));
      } catch (error) {
        console.error(error);
      }
    }, [user?.result?._id]);
  
      
    useEffect(() => {
        getTotalCount();
        dispatch(getInventoryByUser({ search: user.result._id || user.result.googleId }));
      }, [getTotalCount, dispatch, user?.result?._id || user?.result?.googleId]);
      
      useEffect(() => {
        console.log(inventoryItems)
        if (inventoryItems) {
          setAvailableItems(inventoryItems);
        }
      }, [inventoryItems]);






    useEffect(() => {
        if (id) {
          dispatch(getInvoice(id));
        }
      }, [id, dispatch]);

    useEffect(() => {
        dispatch(getClientsByUser({search: user?.result._id || user?.result?.googleId}));
        // eslint-disable-next-line
    }, [dispatch]);


    useEffect(() => {
      // Don't update state if values are the same, prevent re-render loops
      if (invoice) {
          setInvoiceData(prevData => {
              if (
                prevData !== invoice || // Compare objects directly
                prevData.rates !== invoice.rates ||
                prevData.client !== invoice.client ||
                prevData.dueDate !== invoice.dueDate
              ) {
                return { ...invoice };
              }
              return prevData;
          });
      }
  }, [invoice]);  // Keep dependencies minimal
  

 
    useEffect(() => {
        setStatus(type === 'Receipt' ? 'Paid' : 'Unpaid');
    }, [type]);
    
    const defaultProps = {
        options: currencies,
        getOptionLabel: (option) => option.label
      };

    const clientsProps = {
        options: clients,
        getOptionLabel: (option) => option.name
      };
      
    
    const handleDateChange = (date) => {
      setSelectedDate(date);
    };

  const handleRates =(e) => {
    setRates(e.target.value)
    setInvoiceData((prevState) => ({...prevState, tax: e.target.value}))
  }

    // console.log(invoiceData)
    // Change handler for dynamically added input field
    const handleChange = (index, e) => {
      const { name, value } = e.target;
      setInvoiceData(prevState => {
        const updatedItems = [...prevState.items];
        if (name === 'itemName') {
          const selectedItem = availableItems.find(item => item.itemName === value);
          if (selectedItem) {
            updatedItems[index] = {
              ...updatedItems[index],
              itemName: selectedItem.itemName,
              unitPrice: selectedItem.unitPrice,
              quantity: updatedItems[index].quantity || 1,
              inventoryItem: selectedItem._id
            };
          }
        } else {
          updatedItems[index] = {
            ...updatedItems[index],
            [name]: value
          };
        }
        return { ...prevState, items: updatedItems };
      });
    };

    useEffect(() => {
            //Get the subtotal
            const subTotal =()=> {
            var arr = document.getElementsByName("amount");
            var subtotal = 0;
            for(var i = 0; i < arr.length; i++) {
                if(arr[i].value) {
                    subtotal += +arr[i].value;
                }
                // document.getElementById("subtotal").value = subtotal;
                setSubTotal(subtotal)
            }
        }

        subTotal()
       
    }, [invoiceData])


    useEffect(() => {
        const total =() => {
            
            //Tax rate is calculated as (input / 100 ) * subtotal + subtotal 
            const overallSum = rates /100 * subTotal + subTotal
            //VAT is calculated as tax rates /100 * subtotal
            setVat(rates /100 * subTotal)
            setTotal(overallSum)


        }
        total()
    }, [invoiceData, rates, subTotal])
    

    const handleAddField = (e) => {
        e.preventDefault()
        setInvoiceData((prevState) => ({
          ...prevState, 
          items: [
            ...prevState.items,  
            {itemName: '', unitPrice: '', quantity: '', discount: '', amount: '', inventoryItem: null}
          ]
        }))
    }

    const handleRemoveField =(index) => {
        const values = invoiceData.items
        values.splice(index, 1)
        setInvoiceData((prevState) => ({...prevState, values}))
        // console.log(values)
    }
    


    const handleSubmit = async (e) => {
      e.preventDefault();
      if (invoice) {
        // ... (existing update logic)
      } else {
        const formattedItems = invoiceData.items.map(item => ({
          inventoryItem: item.inventoryItem, // Make sure this field is set when selecting an item
          quantity: item.quantity,
          discount: item.discount || 0
        }));

        const newInvoice = {
          ...invoiceData,
          items: formattedItems,
          subTotal: subTotal,
          total: total,
          vat: vat,
          rates: rates,
          currency: currency,
          dueDate: selectedDate,
          invoiceNumber: `INV-${new Date().getFullYear()}-${invoiceData.invoiceNumber.padStart(3, '0')}`,
          client: client,
          type: type,
          status: status,
          paymentRecords: [],
          creator: user?.result?._id || user?.result?.googleId,
          totalAmountReceived: 0,
          createdAt: new Date().toISOString()
        };

        dispatch(createInvoice(newInvoice, history));
      }
    };

    const classes = useStyles()
    const [open, setOpen] = useState(false);

    const CustomPaper = (props) => {
        return <Paper elevation={3} {...props} />;
      };


      if(!user) {
        history.push('/login')
      }
    

    return (
    <div className={styles.invoiceLayout}>
        <form onSubmit={handleSubmit} className="mu-form">
            <AddClient setOpen={setOpen} open={open} />
            <Container  className={classes.headerContainer}>
                
                <Grid container justifyContent="space-between" >
                    <Grid item>
                        {/* <Avatar alt="Logo" variant='square' src="" className={classes.large} /> */}
                    </Grid>
                    <Grid item>
                        <InvoiceType type={type} setType={setType} />
                        Invoice #:
                        <div style={{
                            marginTop: '15px',
                            width: '100px',
                            padding: '8px',
                            display: 'inline-block',
                            backgroundColor: '#f4f4f4',
                            outline: '0px solid transparent'
                        }} 
                            contenteditable="true"
                            onInput={e => setInvoiceData({
                            ...invoiceData, invoiceNumber: e.currentTarget.textContent})
                            }
                        >
                        <span style={{width:'40px',
                            color: 'black',
                            padding: '15px',
                        }} 
                            contenteditable="false"> {invoiceData.invoiceNumber}</span>
                        <br/>
                        </div>
                    </Grid>
                </Grid >
            </Container>
            <Divider />
            <Container>
                <Grid container justifyContent="space-between" style={{marginTop: '40px'}} >
                    <Grid item style={{width: '50%'}}>
                        <Container>
                            <Typography variant="overline" style={{color: 'gray', paddingRight: '3px'}} gutterBottom>Bill to</Typography>
                            

                            {client  && (
                                <>
                                    <Typography variant="subtitle2" gutterBottom>{client.name}</Typography>
                                    <Typography variant="body2" >{client.email}</Typography>
                                    <Typography variant="body2" >{client.phone}</Typography>
                                    <Typography variant="body2">{client.address}</Typography>
                                    <Button color="primary" size="small" style={{textTransform: 'none'}} onClick={()=> setClient(null)}>Change</Button>
                                </>
                            )}
                            <div style={client? {display: 'none'} :  {display: 'block'}}>
                                <Autocomplete
                                            {...clientsProps}
                                            PaperComponent={CustomPaper}
                                                renderInput={(params) => <TextField {...params}
                                                required={!invoice && true} 
                                                label="Select Customer" 
                                                margin="normal" 
                                                variant="outlined"
                                                />}
                                            value={clients?.name}
                                            onChange={(event, value) => setClient(value)}
                                            
                                    />

                            </div>
                            {!client && 
                                <>
                                <Grid item style={{paddingBottom: '10px'}}>
                                    <Chip
                                        avatar={<Avatar>+</Avatar>}
                                        label="New Customer"
                                        onClick={() => setOpen(true)}
                                        variant="outlined"
                                    />
                                </Grid>
                                </>
                            }
                        </Container>
                    </Grid>

                    <Grid item style={{marginRight: 20, textAlign: 'right'}}>
                        <Typography variant="overline" style={{color: 'gray'}} gutterBottom>Status</Typography>
                        <Typography variant="h6" gutterBottom style={{color: (type === 'Receipt' ? 'green' : 'red')}}>{(type === 'Receipt' ? 'Paid' : 'Unpaid')}</Typography>
                        <Typography variant="overline" style={{color: 'gray'}} gutterBottom>Date</Typography>
                        <Typography variant="body2" gutterBottom>{moment().format("MMM Do YYYY")}</Typography>
                        <Typography variant="overline" style={{color: 'gray'}} gutterBottom>Due Date</Typography>
                        <Typography variant="body2" gutterBottom>{selectedDate? moment(selectedDate).format("MMM Do YYYY") : '27th Sep 2021'}</Typography>
                        <Typography variant="overline" gutterBottom>Amount</Typography>
                        <Typography variant="h6" gutterBottom>{currency} {toCommas(total)}</Typography>
                    </Grid>
                </Grid>
            </Container>

        
    <div>

        <TableContainer component={Paper} className="tb-container">
        <Table className={classes.table} aria-label="simple table">
            <TableHead>
            <TableRow>
                <TableCell>Item</TableCell>
                <TableCell >Qty</TableCell>
                <TableCell>Price</TableCell>
                <TableCell >Disc(%)</TableCell>
                <TableCell >Amount</TableCell>
                <TableCell >Action</TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
            {invoiceData.items.map((itemField, index) => (
                <TableRow key={index}>
                  <TableCell scope="row" style={{width: '40%'}}>
                    <select
                      style={{width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px'}}
                      name="itemName"
                      onChange={(e) => handleChange(index, e)}
                      value={itemField.itemName || ''}
                    >
                      <option value="">Select an item</option>
                      {availableItems.map((item, i) => (
                        <option key={i} value={item.itemName}>{item.itemName}</option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell align="right">
                    <InputBase
                      sx={{ ml: 1, flex: 1 }}
                      type="number"
                      name="quantity"
                      onChange={e => handleChange(index, e)}
                      value={itemField.quantity}
                      placeholder="0"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <InputBase
                      sx={{ ml: 1, flex: 1 }}
                      type="number"
                      name="unitPrice"
                      onChange={e => handleChange(index, e)}
                      value={itemField.unitPrice}
                      placeholder="0"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <InputBase
                      sx={{ ml: 1, flex: 1 }}
                      type="number"
                      name="discount"
                      onChange={e => handleChange(index, e)}
                      value={itemField.discount}
                      placeholder="0"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <InputBase
                      sx={{ ml: 1, flex: 1 }}
                      type="number"
                      name="amount"
                      onChange={e => handleChange(index, e)}
                      value={(itemField.quantity * itemField.unitPrice) - (itemField.quantity * itemField.unitPrice) * itemField.discount / 100}
                      disabled
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleRemoveField(index)}>
                      <DeleteOutlineRoundedIcon style={{width: '20px', height: '20px'}}/>
                    </IconButton>
                  </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
        </TableContainer>
            <div className={styles.addButton}>
                <button onClick={handleAddField}>+</button>
            </div>
    </div>
                    
        <div className={styles.invoiceSummary}>
            <div className={styles.summary}>Invoice Summary</div>
            <div className={styles.summaryItem}>
                <p>Sub total:</p>
                <h4>{subTotal}</h4>
            </div>
            <div className={styles.summaryItem}>
                <p>VAT(%):</p>
                <h4>{vat}</h4>
            </div>
            <div className={styles.summaryItem}>
                <p>Total</p>
                <h4 style={{color: "black", fontSize: "18px", lineHeight: "8px"}}>{currency} {toCommas(total)}</h4>
            </div>
            
        </div>

        
        <div className={styles.toolBar}>
            <Container >
                <Grid container >
                    <Grid item style={{marginTop: '16px', marginRight: 10}}>
                        <TextField 
                            type="text" 
                            step="any" 
                            name="rates" 
                            id="rates" 
                            value={rates} 
                            onChange={handleRates} 
                            placeholder="e.g 10" 
                            label="Tax Rates(%)"
                            
                        />
                    </Grid>
                    <Grid item style={{marginRight: 10}} >
                        
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                                margin="normal"
                                id="date-picker-dialog"
                                label="Due date"
                                format="MM/dd/yyyy"
                                value={selectedDate}
                                onChange={handleDateChange}
                                KeyboardButtonProps={{
                                    'aria-label': 'change date',
                                }}
                            />
                        </ MuiPickersUtilsProvider>
                    </Grid>
                    <Grid item style={{ width: 270, marginRight: 10 }}>
                        <Autocomplete
                                {...defaultProps}
                                id="debug"
                                debug
                                    renderInput={(params) => <TextField {...params} 
                                    label="Select currency" 
                                    margin="normal" 
                                    />}
                                value={currency.value}
                                onChange={(event, value) => setCurrency(value.value)}
                                
                            
                        />
                    </Grid>
                </Grid>
                
            </Container>
        </div>
            <div className={styles.note}>
                <h4>Note/Payment Info</h4>
                <textarea 
                style={{border: 'solid 1px #d6d6d6', padding: '10px'}}
                    placeholder="Provide additional details or terms of service"
                    onChange={(e) => setInvoiceData({...invoiceData, notes: e.target.value})}
                    value={invoiceData.notes}
                />
            </div>

            {/* <button className={styles.submitButton} type="submit">Save and continue</button> */}
            <Grid container justifyContent="center">
            <Button
                variant="contained"
                style={{justifyContentContent: 'center'}}
                type="submit"
                color="primary"
                size="large"
                className={classes.button}
                startIcon={<SaveIcon />}
            >
                Save and Continue
            </Button>
            </Grid>
        </form>
    </div>
    )
}

export default Invoice