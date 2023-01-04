import React from "react";
import {
  setPresaleGeneralInfo,
  PresaleGeneralInfo,
  DataType,
} from "../../store";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

interface additionalInfoProps {
  handleNextStep?: any;
  handleBackStep?: any;
}

const AdditionalInfo = ({
  handleNextStep,
  handleBackStep,
}: additionalInfoProps): JSX.Element => {
  const dispatch = useDispatch();
  const { presaleGeneralInfo } = useSelector((state: DataType) => state);

  const SignupSchema = Yup.object().shape({
    logoURL: Yup.string().url().nullable().required("Required"),
    websiteURL: Yup.string().url().nullable().required("Required"),
    TwitterURL: Yup.string().url().nullable(),
    TelegramURL: Yup.string().url().nullable(),
    DiscordURL: Yup.string().url().nullable(),
    Description: Yup.string().nullable(),
  });

  
  return (
    <>
      <Formik
        initialValues={{
          logoURL: presaleGeneralInfo?.logoURL,
          websiteURL: presaleGeneralInfo?.websiteURL,
          TwitterURL: presaleGeneralInfo?.TwitterURL,
          TelegramURL: presaleGeneralInfo?.TelegramURL,
          DiscordURL: presaleGeneralInfo?.DiscordURL,
          Description: presaleGeneralInfo?.Description,
        }}
        validationSchema={SignupSchema}
        onSubmit={(values) => {
          dispatch(setPresaleGeneralInfo(values));
          handleNextStep();
        }}
      >
        {() => (
          <Form>
            <div className="launchpad-info-section additional-info">
              <div className="info-msg font s14 color">(*) required field.</div>
              <div className="grid-section">
                <div className="field-blk">
                  <div className="label font">
                    Logo URL <span className="star">*</span>
                  </div>
                  <div className="filed">
                    <Field
                      name="logoURL"
                      type="text"
                      className="iput font"
                      placeholder="Ex: https://..."
                    />
                  </div>
                  <div className="field-msg font red">
                    <ErrorMessage name="logoURL" />
                  </div>
                </div>
                <div className="field-blk">
                  <div className="label font">
                    Website <span className="star">*</span>
                  </div>
                  <div className="filed">
                    <Field
                      name="websiteURL"
                      type="text"
                      className="iput font"
                      placeholder="Ex: https://..."
                    />
                  </div>
                  <div className="field-msg font red">
                    <ErrorMessage name="websiteURL" />
                  </div>
                </div>
                {/* <div className="field-blk">
                  <div className="label font">Facebook</div>
                  <div className="filed">
                    <Field
                      name="facebookURL"
                      type="text"
                      className="iput font"
                      placeholder="Ex: https://facebook.com/"
                    />
                  </div>
                </div> */}
                <div className="field-blk">
                  <div className="label font">Twitter</div>
                  <div className="filed">
                    <Field
                      name="TwitterURL"
                      type="text"
                      className="iput font"
                      placeholder="Ex: https://twitter.com/"
                    />
                  </div>
                  <div className="field-msg font red">
                    <ErrorMessage name="TwitterURL" />
                  </div>
                </div>
                {/* <div className="field-blk">
                  <div className="label font">Github</div>
                  <div className="filed">
                    <Field
                      name="GitHubURL"
                      type="text"
                      className="iput font"
                      placeholder="Ex: https://github.com/"
                    />
                  </div>
                </div> */}
                <div className="field-blk">
                  <div className="label font">Telegram</div>
                  <div className="filed">
                    <Field
                      name="TelegramURL"
                      type="text"
                      className="iput font"
                      placeholder="Ex: https://telegram.com/"
                    />
                  </div>
                  <div className="field-msg font red">
                    <ErrorMessage name="TelegramURL" />
                  </div>
                </div>
                {/* <div className="field-blk">
                  <div className="label font">Instagram</div>
                  <div className="filed">
                    <Field
                      name="InstagramURL"
                      type="text"
                      className="iput font"
                      placeholder="Ex: https://instagram.com/"
                    />
                  </div>
                </div> */}
                <div className="field-blk">
                  <div className="label font">Discord</div>
                  <div className="filed">
                    <Field
                      name="DiscordURL"
                      type="text"
                      className="iput font"
                      placeholder="Ex: https://discord.com/"
                    />
                  </div>
                  <div className="field-msg font red">
                    <ErrorMessage name="DiscordURL" />
                  </div>
                </div>
              </div>
              {/* <div className="field-blk">
                <div className="label font">Reddit</div>
                <div className="filed">
                  <Field
                    name="RedditURL"
                    type="text"
                    className="iput font"
                    placeholder="Ex: https://reddit.com/"
                  />
                </div>
              </div> */}
              <br />
              <div className="field-blk">
                <div className="label font">Description</div>
                <div className="filed">
                  <Field
                    name="Description"
                    component="textarea"
                    className="iput area font"
                    placeholder="Tell us about your project"
                  />
                </div>
              </div>

              <div className="ftr">
                <div className="actions flex aic">
                  <button className="btn back font" onClick={handleBackStep}>
                    Back
                  </button>
                  <button className="btn next font" type="submit">
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* 
            <div className="ftr-description">
              <div className="txt font">
                Disclaimer: The information provided shall not in any way constitute a
                recommendation as to whether you should invest in any product
                discussed. We accept no liability for any loss occasioned to any
                person acting or refraining from action as a result of any material
                provided or published.
              </div>
            </div> */}
          </Form>
        )}
      </Formik>
    </>
  );
};

export default AdditionalInfo;
