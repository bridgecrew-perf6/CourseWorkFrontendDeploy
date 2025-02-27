import {observer} from "mobx-react-lite";
import * as React from "react";
import {useContext, useEffect, useState} from "react";
import {Context} from "../../index";
import {Box, Button, Card, CardContent, CardHeader, Container, Grid, Modal, TextField, Typography} from "@mui/material";
import SnackbarConstructor from "../common/snackbarConstructor/SnackbarConstructor";
import {DataGrid, GridColDef, GridToolbar, ruRU} from "@mui/x-data-grid";
import {Delete} from "@mui/icons-material";
import {useNavigate} from "react-router";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 1000,
    bgcolor: 'background.paper',
    borderRadius: "6px",
    boxShadow: 24,
    p: 4,
    textAlign: 'center'
};

const OrderManagementPage = observer(() => {
    const navigate = useNavigate()
    const {orderStore, userStore} = useContext(Context)
    const [orderTypes, setOrders] = useState([])
    const [orderResponses, setOrderResponses] = useState([])
    const [user, setUser] = useState({})
    const [open, setOpen] = useState(false);
    const [render, setRender] = useState(false)
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    useEffect(() => {
            orderStore.getOrderTypes().then(r => {
                const types = r.data;
                setOrders(types)
            })
            orderStore.getAllResponsesForOrder(orderStore.currentOrderId).then((r) => {
                setOrderResponses(r.data)
            })
            orderStore.getOrderById(orderStore.currentOrderId).then()
        }, [render]
    )

    const columns: GridColDef[] = [
        {
            field: 'assign', headerName: "", width: 320, renderCell: params => {
                return (
                    <Button color={"success"} variant={"outlined"} onClick={() => {
                        orderStore.assignUserToOrder(orderStore.currentOrderId, params.row.id)
                            .then((r) => {
                                setRender(!render)
                                SnackbarConstructor("alertAfterAssigningUserToOrder", "success", "Пользователь успешно назначен на заказ")
                            })
                    }}>
                        Назначить на выполнение заказа
                    </Button>
                )
            }
        },
        {
            field: 'more', headerName: "", width: 270, renderCell: params => {
                return (
                    <Button color={"primary"} variant={"outlined"} onClick={() => {
                        userStore.getUserInfo(params.row.email).then((r) => {
                            setUser(r.data)
                            handleOpen()
                        })
                    }}>
                        Подробнее о пользователе
                    </Button>
                )
            }
        },
        {field: 'fullName', headerName: 'ФИО', width: 300},
        {field: 'email', headerName: 'Эл.почта', width: 215},
        {field: 'telephoneNumber', headerName: 'Номер телефона', width: 170}
    ]

    return (
        <div style={{height: '100%', width: '90%', margin: 'auto'}}>
            <Card style={{marginTop: "20px", marginBottom: "10px"}} variant={"outlined"}>
                <CardContent>
                    <Box>
                        <Container maxWidth={"lg"}>
                            <Grid container spacing={5}>
                                <Grid item xs={12} sm={10}>
                                    <Typography>
                                        <p><h3>{orderStore.currentManagedOrder.subject}</h3></p>
                                    </Typography>
                                    <Typography>
                                        <p><b>Статус:</b> {orderStore.currentManagedOrder.status}</p>
                                    </Typography>
                                    <Typography>
                                        <p><b>Категория:</b> {orderStore.currentManagedOrder.type}</p>
                                    </Typography>
                                    <Typography>
                                        <p><b>Срок
                                            сдачи:</b> {orderStore.currentManagedOrder.deadline}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                            <b>Стоимость:</b> {orderStore.currentManagedOrder.price}&#x20bd;</p>
                                    </Typography>
                                </Grid>
                                {orderStore.currentManagedOrder.status === "Готов к проверке" ?
                                    <Grid item xs={12} sm={2}>
                                        <Button color={"success"} variant={"contained"} style={{marginTop: "50px"}}
                                                onClick={() => {
                                                    orderStore.changeOrderStatus(orderStore.currentOrderId, "COMPLETED").then(() => {
                                                        setRender(!render)
                                                    })
                                                }}>
                                            Заказ выполнен
                                        </Button>
                                    </Grid>
                                    : <div></div>
                                }
                            </Grid>
                            <TextField
                                id="orderDescription"
                                name="orderDescription"
                                label="Описание"
                                type={"text"}
                                value={orderStore.currentManagedOrder.description}
                                disabled
                                fullWidth={true}
                                rows={16}
                                multiline
                                InputLabelProps={{shrink: true}}
                                style={{marginBottom: "10px"}}
                            />
                        </Container>
                    </Box>


                </CardContent>
            </Card>
            {orderStore.currentManagedOrderExecutor == null ?
                (<div style={{height: '424px', width: '100%'}}>
                    <DataGrid
                        rows={orderResponses}
                        columns={columns}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        components={{
                            Toolbar: GridToolbar,
                        }}
                        localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
                    />
                </div>)
                :
                (<Card style={{marginTop: "20px", marginBottom: "10px"}} variant={"outlined"}>
                    <CardHeader title={"Исполнитель"}/>
                    <CardContent>
                        <Typography>
                            <p><h3>{orderStore.currentManagedOrderExecutor.fullName}</h3></p>
                        </Typography>
                        <Typography>
                            <p><b>Эл. почта:</b> {orderStore.currentManagedOrderExecutor.email}</p>
                        </Typography>
                        <Typography>
                            <p><b>Номер телефона:</b> {orderStore.currentManagedOrderExecutor.telephoneNumber}</p>
                        </Typography>
                        <TextField
                            id="userDescription"
                            name="userDescription"
                            label="Описание"
                            type={"text"}
                            value={orderStore.currentManagedOrderExecutor.description}
                            disabled
                            fullWidth={true}
                            rows={16}
                            multiline
                            InputLabelProps={{shrink: true}}
                            style={{marginBottom: "10px"}}
                        />
                    </CardContent>
                </Card>)
            }
            <Box textAlign={"center"}>
                <Button startIcon={<Delete/>} color={"error"} variant={"contained"} style={{marginTop: "20px"}}
                        onClick={() => {
                            orderStore.deleteOrder(orderStore.currentOrderId).then((r) => {
                                navigate("/personalAccount")
                            })
                        }}>
                    Удалить заказ
                </Button>
            </Box>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography>
                        <p><h3>{user.fullName}</h3></p>
                    </Typography>
                    <Typography>
                        <p><b>Эл. почта:</b> {user.email}</p>
                    </Typography>
                    <Typography>
                        <p><b>Номер телефона:</b> {user.telephoneNumber}</p>
                    </Typography>
                    <TextField
                        id="userDescription"
                        name="userDescription"
                        label="Описание"
                        type={"text"}
                        value={user.description}
                        disabled
                        fullWidth={true}
                        rows={16}
                        multiline
                        InputLabelProps={{shrink: true}}
                        style={{marginBottom: "10px"}}
                    />
                </Box>
            </Modal>
            <div id={"alertAfterAssigningUserToOrder"}/>
        </div>
    )
})

export default OrderManagementPage;