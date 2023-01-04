import React from "react";
import { SalesDataType } from "../store";

// import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { ethers } from "ethers";
import { Presale } from "../typechain";

const PresaleABI = require("../abis/Presale.json");


interface additionalInfoProps {
  saleID: string,
  setPresaleData: React.Dispatch<React.SetStateAction<SalesDataType | null | undefined>>,
  logoURL: string, websiteURL: string, TwitterURL: string, TelegramURL: string, DiscordURL: string, Description: string
}

const ProductDetailModel = ({
  saleID, setPresaleData, logoURL, websiteURL, TwitterURL, TelegramURL, DiscordURL, Description
}: additionalInfoProps): JSX.Element => {
  // const dispatch = useDispatch();
  // const { presaleGeneralInfo } = useSelector((state: DataType) => state);

  // console.log("Model  logoURL", logoURL)
  // console.log("Model  Description", Description)

  const SignupSchema = Yup.object().shape({
    logoURL: Yup.string().url().nullable().required("Required"),
    websiteURL: Yup.string().url().nullable().required("Required"),
    TwitterURL: Yup.string().url().nullable(),
    TelegramURL: Yup.string().url().nullable(),
    DiscordURL: Yup.string().url().nullable(),
    Description: Yup.string().nullable()
  });

  // const handleDescription = (e: string, setFieldValue: any) => {
  //   setFieldValue("Description", e)
  // }



  return (
    <>
      <Formik
        initialValues={{
          logoURL: logoURL,
          websiteURL: websiteURL,
          TwitterURL: TwitterURL,
          TelegramURL: TelegramURL,
          DiscordURL: DiscordURL,
          Description: Description,
        }}
        validationSchema={SignupSchema}
        onSubmit={async (values) => {

          let provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          // let launchPadAddress = await getLaunchPadAddress(provider);

          const presaleContract = new ethers.Contract(
            saleID,
            PresaleABI.abi,
            provider
          ) as Presale;

          const updateTx = presaleContract.connect(signer);

          try {
            const tx = await updateTx.updateGeneralInfo({
              logoURL: values.logoURL,
              websiteURL: values.websiteURL,
              twitterURL: values.TwitterURL,
              telegramURL: values.TelegramURL,
              discordURL: values.DiscordURL,
              description: values.Description
            })

            await tx.wait();

            setPresaleData((e) => {
              if (!e) return;

              const presaleGeneralInfo = {
                logoURL: values.logoURL,
                websiteURL: values.websiteURL,
                TwitterURL: values.TwitterURL,
                TelegramURL: values.TelegramURL,
                DiscordURL: values.DiscordURL,
                Description: values.Description
              }

              return { ...e, presaleGeneralInfo }
            })


          }
          catch (e) {
            console.log(e)
          }


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
              < br />

              {/* <div className="field-blk">
                <div className="label font">Description</div>
                <div className="filed">
                  <textarea
                    name="Description"
                    className="iput area font"
                    placeholder="Tell us about your project"
                    onChange={(e) => handleDescription(e.target.value, setFieldValue)}
                  />
                </div>
              </div> */}

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
                  <button className="btn next font" type="submit">
                    Update
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

export default ProductDetailModel;
