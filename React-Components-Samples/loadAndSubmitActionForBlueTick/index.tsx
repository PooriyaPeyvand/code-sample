import React, { FC, ReactNode, useMemo, useState } from 'react';
import { Button, Card, CardBody, CardHeader, Form, FormFeedback, FormGroup, Label } from 'reactstrap';
import {
  accepted,
  blue,
  blueTickAcceptDescription,
  cancel,
  canceledBlueTickDescription,
  companyApplied,
  confirm,
  confirmAllConditions,
  date,
  description,
  empty,
  enter,
  history,
  list,
  please,
  reasons,
  reject,
  request,
  status,
  submit,
  thisCompanyHasBlueTick,
  tick,
} from 'tools/i18n/constants/i18n';
import { useTranslation } from 'react-i18next';
import { APP_HELPER, BLUE_TICKET_STATUS, BLUE_TICKET_STATUS_UI } from 'tools/enums';
import Icon from 'components/icons';
import { t_blueTickStatus } from 'tools/types';
import ShowIndicator from 'pages/content-management/company/companies/components/showIndicator';
import useBlueTickRequest from 'pages/content-management/company/companies/useBlueTickRequest';
import { useParams } from 'react-router-dom';
import { isNew, toDate } from 'tools/methods';
import { ApolloError } from '@apollo/client';
import { Loading } from 'components';
import Modal from 'components/modal';
import { t_toggleValueFunc, useToggle } from 'hooks';
import { BLUE_TICK_ACTION } from 'services/graphql/queries/companies';
import UploadProfileImage from 'components/uploadProfileImage';
import { useForm } from 'react-hook-form';
import useMutation from 'hooks/useMutation';

type t_ticketStatusValue = {
  name: t_blueTickStatus;
  rejectPurpose: t_blueTickStatus;
  indicator: React.ReactElement;
  title?: ReactNode;
  modalHeader?: string;
  modalBodyTitle?: string;
  modalInputLabel?: string;
  logoUrl?: string;
  companyName?: string;
  buttons: {
    isDisabled: boolean;
    isConfirmed: boolean;
    isRejected: boolean;
    rejectLabel: string;
    confirmClassName: string;
    rejectClassName: string;
    className: string;
  };
};

export default function BlueTick() {
  const { type } = useParams();
  return isNew(type as string) ? <NewBlueTickRequest /> : <UpdateBlueTickRequest />;
}

function UpdateBlueTickRequest() {
  const { data, error, loading, refetch } = useBlueTickRequest();
  return (
    <Loading loading={loading} failed={!!error} onRetry={refetch}>
      <BlueTickComponents isNew={false} refetch={refetch} requireData={{ data, error, loading }} />
    </Loading>
  );
}

function NewBlueTickRequest() {
  return <BlueTickComponents requireData={undefined} isNew={true} />;
}

interface BlueTickComponentsProps<T extends boolean> {
  isNew: T;
  refetch?: any;
  requireData: T extends true
    ? undefined
    : {
        data: any;
        error?: ApolloError;
        loading: boolean;
      };
}

const BlueTickComponents: FC<BlueTickComponentsProps<boolean>> = (props) => {
  const { requireData, refetch } = props;
  const { type } = useParams();
  const data = requireData?.data?.blueMark;
  const logoUrl = requireData?.data?.logoUrl;
  const companyName = requireData?.data?.companyName;
  const [execute, { error, loading }] = useMutation(BLUE_TICK_ACTION);
  const [currentBlueTickStatus, setCurrentBlueTickStatus] = useState<t_blueTickStatus>(data?.status);
  const [toggleModal, modalToggler] = useToggle(false);
  const [modalStatus, setModalStatus] = useState<t_blueTickStatus>(BLUE_TICKET_STATUS.NOT_REQUESTED);
  const { t } = useTranslation();
  const TICKET_STATUS: Record<t_blueTickStatus, t_ticketStatusValue> = useMemo(
    () => ({
      [BLUE_TICKET_STATUS.ACCEPTED]: {
        name: BLUE_TICKET_STATUS.ACCEPTED,
        rejectPurpose: BLUE_TICKET_STATUS.CANCELED,
        indicator: <ShowIndicator status={BLUE_TICKET_STATUS_UI.ACCEPTED} />,
        title: t(thisCompanyHasBlueTick),
        logoUrl: logoUrl,
        companyName: companyName,
        buttons: {
          confirmClassName: 'd-none',
          rejectClassName: 'flex-grow-1',
          className: '',
          rejectLabel: `${t(cancel)} ${t(blue)} ${t(tick)}`,
          isConfirmed: false,
          isRejected: false,
          isDisabled: false,
        },
      },
      [BLUE_TICKET_STATUS.REJECTED]: {
        name: BLUE_TICKET_STATUS.REJECTED,
        rejectPurpose: BLUE_TICKET_STATUS.REJECTED,
        indicator: <ShowIndicator status={BLUE_TICKET_STATUS_UI.REJECTED} />,
        companyName: companyName,
        modalBodyTitle:
          'Please Enter the reasons for the Reject Blue Tick so that the company will be informed through the notification',
        modalInputLabel: 'Reasons for Reject Blue Tick',
        modalHeader: `${t(reject)} ${t(blue)} ${t(tick)}`,
        title: '',
        logoUrl: logoUrl,
        buttons: {
          confirmClassName: '',
          rejectClassName: '',
          className: 'd-none',
          rejectLabel: '',
          isConfirmed: false,
          isRejected: false,
          isDisabled: false,
        },
      },
      [BLUE_TICKET_STATUS.CANCELED]: {
        name: BLUE_TICKET_STATUS.CANCELED,
        rejectPurpose: BLUE_TICKET_STATUS.CANCELED,
        indicator: <ShowIndicator status={BLUE_TICKET_STATUS_UI.CANCELED} />,
        title: t(canceledBlueTickDescription),
        companyName: companyName,
        logoUrl: logoUrl,
        modalHeader: `${t(cancel)} ${t(blue)} ${t(tick)}`,
        modalBodyTitle:
          'Please Enter the reasons for the Cancel Blue Tick so that the company will be informed through the notification',
        modalInputLabel: 'Reasons for Cancel Blue Tick',
        buttons: {
          confirmClassName: 'd-none',
          rejectClassName: 'd-none',
          className: '',
          rejectLabel: '',
          isConfirmed: false,
          isRejected: false,
          isDisabled: false,
        },
      },
      [BLUE_TICKET_STATUS.NOT_REQUESTED]: {
        name: BLUE_TICKET_STATUS.NOT_REQUESTED,
        rejectPurpose: BLUE_TICKET_STATUS.CANCELED,
        logoUrl: logoUrl,
        companyName,
        indicator: <ShowIndicator status={BLUE_TICKET_STATUS_UI.NOT_REQUESTED} />,
        title: '',
        buttons: {
          confirmClassName: '',
          rejectClassName: '',
          className: '',
          rejectLabel: '',
          isConfirmed: false,
          isRejected: false,
          isDisabled: false,
        },
      },
      [BLUE_TICKET_STATUS.IN_PROGRESS]: {
        name: BLUE_TICKET_STATUS.IN_PROGRESS,
        rejectPurpose: BLUE_TICKET_STATUS.REJECTED,
        logoUrl: logoUrl,
        companyName,
        indicator: <ShowIndicator status={BLUE_TICKET_STATUS_UI.IN_PROGRESS} />,
        modalHeader: `${t(reject)} ${t(blue)} ${t(tick)}`,
        title: (
          <>
            {`${t(companyApplied)} .`}
            <br />
            {`${t(confirmAllConditions)} ?`}
          </>
        ),
        buttons: {
          confirmClassName: '',
          rejectClassName: '',
          className: '',
          rejectLabel: t(reject),
          isConfirmed: false,
          isRejected: false,
          isDisabled: false,
        },
      },
    }),
    [data, logoUrl, companyName]
  );
  const currentStatus = TICKET_STATUS[currentBlueTickStatus];
  const handleChangeModalStatus = () => {
    const toVal = currentStatus.rejectPurpose;
    setModalStatus(toVal);
    modalToggler(true);
  };
  const handleChangeModalConfirm = () => {
    setModalStatus(BLUE_TICKET_STATUS.ACCEPTED);
    modalToggler(true);
  };
  const handleModalConfirm = (reason?: string) => {
    execute({
      variables: {
        id: parseInt(type as string),
        status: modalStatus,
        description: reason || '',
      },
    }).then((result) => {
      console.log(result);
      setCurrentBlueTickStatus(modalStatus);
      modalToggler();
      refetch();
    });
  };
  return (
    <>
      {toggleModal && (
        <ModalHandler
          loading={loading}
          error={error}
          handleModalConfirm={handleModalConfirm}
          toggleOpen={modalToggler}
          status={modalStatus}
          blueTickOptions={TICKET_STATUS}
          isOpen={true}
        />
      )}

      <Card>
        <CardHeader className="py-3">
          <div className="d-flex align-items-center">
            <h5>{`${t(blue)} ${t(tick)} ${t(status)}`}</h5>
            {currentStatus?.indicator || ''}
          </div>
        </CardHeader>
        <CardBody className={`${currentStatus?.title ? '' : 'd-none'}`}>
          <div className={`d-flex flex-column px-5`}>
            <h6>{currentStatus?.title}</h6>
            <div className={`d-flex mt-3 w-100 mx-auto ${currentStatus.buttons.className}`}>
              <div
                onClick={handleChangeModalConfirm}
                role="button"
                className={`shadow-bg-success p-2 text-center rounded flex-grow-1 mr-2 ${currentStatus.buttons.confirmClassName}`}
              >
                {t(confirm)}
              </div>
              <div
                onClick={handleChangeModalStatus}
                role="button"
                className={`shadow-bg-danger p-2 text-center rounded flex-grow-1 ml-2 ${currentStatus.buttons.rejectClassName}`}
              >
                {currentStatus.buttons.rejectLabel}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader className="py-3">
          <h5 className="d-flex align-items-center">
            <Icon Name="FiClock" />
            <span className="ml-2">{`${t(request)} ${t(history)}`}</span>
          </h5>
        </CardHeader>
        <CardBody className="pt-2 px-0">
          <div className="d-flex flex-column">
            <CardHeader className="pt-0 pb-2 d-flex align-items-center justify-content-between">
              <div className="d-flex flex-grow-1 w-25">
                <Icon Name="FiCalendar" />
                <b className="ml-2">{t(date)}</b>
              </div>
              <div className="d-flex flex-grow-1 w-25">
                <Icon Name="FiActivity" />
                <b className="ml-2">{t(status)}</b>
              </div>
              <div className="d-flex flex-grow-1 w-50">
                <Icon Name="FiType" />
                <b className="ml-2">{t(description)}</b>
              </div>
            </CardHeader>
            <CardBody className={`${!data.logs?.length ? 'pb-2' : ''}`}>
              {data.logs?.length ? (
                data.logs?.map((item: any) => {
                  const concatDate = toDate(item?.updatedAt || item.createdAt);
                  return (
                    <div key={item.id} className="d-flex flex-nowrap align-items-center justify-content-between mb-3">
                      <span className="w-25">{concatDate || APP_HELPER.emptyDescription}</span>
                      <span className="w-25">{BLUE_TICKET_STATUS_UI[item.status]}</span>
                      <span className="w-50">{item.description || APP_HELPER.emptyDescription}</span>
                    </div>
                  );
                })
              ) : (
                <h6>{`${t(empty)} ${t(request)} ${t(list)}`}</h6>
              )}
            </CardBody>
          </div>
        </CardBody>
      </Card>
    </>
  );
};

interface ModalHandlerProps {
  status: t_blueTickStatus;
  blueTickOptions: Record<t_blueTickStatus, t_ticketStatusValue>;
  isOpen: boolean;
  toggleOpen: t_toggleValueFunc;
  handleModalConfirm: (reason: string) => void;
  loading: boolean;
  error?: ApolloError;
}

const ModalHandler: FC<ModalHandlerProps> = (props) => {
  const { status, isOpen, blueTickOptions, toggleOpen, handleModalConfirm, loading } = props;
  const { t } = useTranslation();
  const errorText = `${t(please)} ${t(enter)} ${t(reasons)}`;
  const {
    handleSubmit,
    register,
    setError,
    formState: { errors },
  } = useForm<{ reason?: string }>({
    defaultValues: {
      reason: '',
    },
  });
  const onSubmit = (data: any) => {
    console.log(data);
    console.log(status);
    if (status) {
      handleModalConfirm(data.reason);
    } else {
      if (!data.reason) {
        setError('reason', { type: 'required', message: errorText });
      }
    }
  };
  const currentStatus = blueTickOptions[status];
  const modalUI = {
    [BLUE_TICKET_STATUS.ACCEPTED]: {
      header: '',
      bodyTitle: currentStatus.modalBodyTitle,
      content: (
        <Form className="px-5" onSubmit={handleSubmit(onSubmit, console.error)}>
          <div className="mx-auto my-4 make-center">
            <div className="mr-2">
              <UploadProfileImage previewMode={true} defaultImage={currentStatus?.logoUrl} />
            </div>
            <div className="d-flex flex-column">
              <h5>{currentStatus?.companyName}</h5>
              <span>{`${t(accepted)} ${t(blue)} ${t(tick)}`}</span>
            </div>
          </div>
          <b className="mt-3">{t(blueTickAcceptDescription)}</b>
          <div className="d-flex flex-column mt-3">
            <Button
              disabled={loading}
              aria-disabled={loading}
              color=""
              type="submit"
              className="shadow-bg-success mb-2"
            >
              {t(confirm)}
            </Button>
            <Button
              className="border rounded"
              disabled={loading}
              aria-disabled={loading}
              type="button"
              onClick={toggleOpen}
              color=""
            >
              {t(cancel)}
            </Button>
          </div>
        </Form>
      ),
    },
    [BLUE_TICKET_STATUS.REJECTED]: {
      header: currentStatus.modalHeader,
      bodyTitle: currentStatus.modalBodyTitle,
      content: (
        <Form className="mt-3" onSubmit={handleSubmit(onSubmit, console.error)}>
          <FormGroup>
            <Label>
              {currentStatus?.modalInputLabel} <span className="text-danger"> * </span>
            </Label>
            <textarea className="form-control" {...register('reason')} />
            <FormFeedback>{errors?.reason?.message}</FormFeedback>
          </FormGroup>
          <FormGroup className="d-flex flex-column">
            <Button
              disabled={loading}
              aria-disabled={loading}
              type="submit"
              color="danger"
              className="border-0 shadow-bg-danger flex-grow-1"
            >
              {t(reject)}
            </Button>
            <Button
              disabled={loading}
              aria-disabled={loading}
              type="button"
              color=""
              onClick={toggleOpen}
              className="border rounded mt-1 flex-grow-1"
            >
              {t(cancel)}
            </Button>
          </FormGroup>
        </Form>
      ),
    },
    [BLUE_TICKET_STATUS.CANCELED]: {
      header: currentStatus.modalHeader,
      bodyTitle: currentStatus.modalBodyTitle,
      content: (
        <Form className="mt-3" onSubmit={handleSubmit(onSubmit, console.error)}>
          <FormGroup>
            <Label>
              {currentStatus?.modalInputLabel} <span className="text-danger"> * </span>
            </Label>
            <textarea className="form-control" {...register('reason')} />
            <FormFeedback>{errors?.reason?.message}</FormFeedback>
          </FormGroup>
          <Button disabled={loading} aria-disabled={loading} type="submit" className="w-100" color="primary">
            {t(submit)}
          </Button>
        </Form>
      ),
    },
    [BLUE_TICKET_STATUS.IN_PROGRESS]: {
      header: currentStatus.modalHeader,
      bodyTitle: currentStatus.modalBodyTitle,
      content: null,
    },
    [BLUE_TICKET_STATUS.NOT_REQUESTED]: {
      header: currentStatus.modalHeader,
      bodyTitle: currentStatus.modalBodyTitle,
      content: null,
    },
  };
  return (
    <Modal toggleOpen={toggleOpen} isOpen={isOpen} style={{ top: '20%' }} size="lg" title={modalUI[status].header}>
      <>
        {!!modalUI[status]?.bodyTitle && <h6 className="mb-3">{modalUI[status]?.bodyTitle}</h6>}
        {modalUI[status]?.content}
      </>
    </Modal>
  );
};
