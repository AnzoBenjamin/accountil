import React, { useState, useEffect } from "react";
import styles from "./Inventory.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import {
  getInventoryItems,
  createInventoryItem,
  updateInventoryItem,
} from "../../actions/inventoryActions";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import InputBase from "@material-ui/core/InputBase";
import { Container, Grid } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    "& > *": {
      margin: theme.spacing(1),
    },
  },
  table: {
    minWidth: 650,
  },
  headerContainer: {
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(1),
  },
}));

const Inventory = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const { id } = useParams(); // For edit case, get inventory item ID from URL

  const [inventoryData, setInventoryData] = useState({
    itemName: "",
    sku: "",
    quantity: "",
    unitPrice: "",
    category: "",
    threshold: "",
    description: ""
  });
  const [totalInventoryValue, setTotalInventoryValue] = useState(0);

  const { inventoryItems, inventoryItem } = useSelector(
    (state) => state.inventory
  ); // Use Redux state for inventory
  const user = JSON.parse(localStorage.getItem("profile"));
  const [allInventoryItems, setAllInventoryItems] = useState([]);

  useEffect(() => {
    dispatch(getInventoryItems());
  }, [dispatch]);
  
  useEffect(() => {
    if (inventoryItems) {
      setAllInventoryItems(inventoryItems);
      calculateTotalInventoryValue(inventoryItems);
    }
  }, [inventoryItems]);
  // Fetch inventory item if editing an existing one
  useEffect(() => {
    if (id) {
      dispatch(getInventoryItems(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (inventoryItem) {
      setInventoryData(inventoryItem);
    }
  }, [inventoryItem]);

  // Handle input change in each dynamic row
  const handleChange = (e) => {
    setInventoryData({ ...inventoryData, [e.target.name]: e.target.value });
  };

  const calculateTotalInventoryValue = (items) => {
    const total = items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) * parseFloat(item.unitPrice));
    }, 0);
    setTotalInventoryValue(total.toFixed(2));
  };

  // Submit the form to create or update inventory
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted');
    if (inventoryData._id) {
      console.log('Updating inventory item');
      dispatch(updateInventoryItem(inventoryData._id, inventoryData));
    } else {
      console.log('Creating new inventory item');
      dispatch(createInventoryItem(inventoryData, history));
    }
  
    // Update total inventory value
    const updatedItems = inventoryData._id 
      ? allInventoryItems.map(item => item._id === inventoryData._id ? inventoryData : item)
      : [...allInventoryItems, inventoryData];
    calculateTotalInventoryValue(updatedItems);

    setInventoryData({
      itemName: "",
      sku: "",
      quantity: "",
      unitPrice: "",
      category: "",
      threshold: "",
      description: ""
    });
  };

  if (!user) {
    history.push("/login");
  }

  const handleEditItem = (item) => {
    setInventoryData(item);
    window.scrollTo(0, 0);
  };
  return (
    <div className={styles.inventoryLayout}>
      <form onSubmit={handleSubmit} className="mu-form">
        <Container className={classes.headerContainer}>
          <Grid container justifyContent="space-between">
            <Grid item>
              <Typography variant="h4" gutterBottom>
                {id ? "Edit Inventory" : "Add New Inventory"}
              </Typography>
            </Grid>
          </Grid>
        </Container>
        <Divider />
        <Container>
          <TableContainer component={Paper} className="tb-container">
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>SKU</TableCell>
                  <TableCell>Item Name</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Threshold</TableCell>
                  <TableCell align="right">Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                  <TableRow>
                    <TableCell>
                      <InputBase
                        style={{ width: "100%" }}
                        type="text"
                        name="sku"
                        onChange={(e) => handleChange(e)}
                        value={inventoryData.sku}
                        placeholder="SKU"
                      />
                    </TableCell>
                    <TableCell>
                      <InputBase
                        style={{ width: "100%" }}
                        type="text"
                        name="itemName"
                        onChange={(e) => handleChange(e)}
                        value={inventoryData.itemName}
                        placeholder="Item name"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <InputBase
                        type="number"
                        name="quantity"
                        onChange={(e) => handleChange(e)}
                        value={inventoryData.quantity}
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <InputBase
                        type="number"
                        name="unitPrice"
                        onChange={(e) => handleChange(e)}
                        value={inventoryData.unitPrice}
                        placeholder="0"
                      />
                    </TableCell>

                    <TableCell>
                      <InputBase
                        style={{ width: "100%" }}
                        type="text"
                        name="category"
                        onChange={(e) => handleChange(e)}
                        value={inventoryData.category}
                        placeholder="Category"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <InputBase
                        type="number"
                        name="threshold"
                        onChange={(e) => handleChange(e)}
                        value={inventoryData.threshold}
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <InputBase
                        type="text"
                        name="description"
                        value={inventoryData.description}
                        onChange={(e) => handleChange(e)}
                        placeholder="Description"
                      />
                    </TableCell>
                  </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

        </Container>
        <div className={styles.inventorySummary}>
          <Typography variant="h6">
            Total Inventory Value: ${totalInventoryValue}
          </Typography>
        </div>
        <Grid container justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            size="large"
            type="submit"
            startIcon={<SaveIcon />}
          >
            {inventoryData._id ? "Update Inventory" : "Save Inventory"}
          </Button>
        </Grid>
      </form>
      <Container>
        <Typography variant="h6" gutterBottom>
          Available Inventory Items
        </Typography>
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="inventory items table">
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>Item Name</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Threshold</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allInventoryItems.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.itemName}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">{item.unitPrice}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell align="right">{item.threshold}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleEditItem(item)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </div>
  );
};

export default Inventory;